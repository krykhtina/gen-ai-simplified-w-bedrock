import { Construct } from "constructs";
import {
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import {
  CustomResource,
  Duration,
  Names,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { CfnDataSource, CfnKnowledgeBase } from "aws-cdk-lib/aws-bedrock";
import {
  CfnCollection,
  CfnSecurityPolicy,
} from "aws-cdk-lib/aws-opensearchserverless";
import {
  Architecture,
  Code,
  LayerVersion,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BedrockKnowledgeBaseStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const embeddingModelArn =
      "arn:aws:bedrock:us-west-2::foundation-model/amazon.titan-embed-text-v1";
    const KNOWLEDGE_BASE_NAME = "knowledge-base-property-details";
    const COLLECTION_NAME = "OpenSearchCollectionForKnowledgeBase";
    const VECTOR_STORE_NAME = "opensearch-vector-store-kb";
    const KB_BUCKET_ARN = "arn:aws:s3:::omg-properties-knowladge";

    const encryptionPolicy = new CfnSecurityPolicy(
      this,
      `OpenSearchEncryptionPolicy`,
      {
        name: `kb-collection-encryption-policy`,
        description: "The encryption policy for the OpenSearch cluster",
        type: "encryption",
        policy: JSON.stringify({
          Rules: [
            {
              ResourceType: "collection",
              Resource: ["collection/*"],
            },
          ],
          AWSOwnedKey: true,
        }),
      }
    );

    const openSearchServerless = new CfnCollection(this, COLLECTION_NAME, {
      name: VECTOR_STORE_NAME,
      type: "VECTORSEARCH",
    });

    openSearchServerless.addDependency(encryptionPolicy);

    const knowledgeBaseCustomResourceRole = new Role(
      this,
      "knowledgeBaseCustomResourceRole",
      {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        inlinePolicies: {
          ["aossPolicy"]: new PolicyDocument({
            statements: [
              new PolicyStatement({
                resources: ["*"],
                actions: ["aoss:*", "iam:CreateServiceLinkedRole"],
              }),
            ],
          }),
        },
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    const bedrockExecutionRole = new Role(this, "BedrockExecutionRole", {
      assumedBy: new ServicePrincipal("bedrock.amazonaws.com"),
      inlinePolicies: {
        foundationModelPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["bedrock:InvokeModel"],
              resources: [embeddingModelArn],
            }),
          ],
        }),
        s3Policy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["s3:GetObject", "s3:ListBucket"],
              resources: ["*"],
            }),
          ],
        }),
        OpenSearchPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: ["*"],
              actions: ["aoss:*"],
            }),
          ],
        }),
      },
    });

    const dependencyLayer = new LayerVersion(this, "dependencies-layer", {
      code: Code.fromAsset("./lib/knowledgeBase/dependencies"),
      description: "dependencies for lambda",
      compatibleArchitectures: [Architecture.X86_64],
      compatibleRuntimes: [Runtime.NODEJS_18_X],
    });

    const knowledgeBaseCustomResource = new NodejsFunction(
      this,
      "knowledgeBaseCustomResourceLambda",
      {
        entry: "./lib/knowledgeBase/indexCreator.ts",
        handler: "handler",
        runtime: Runtime.NODEJS_18_X,
        timeout: Duration.minutes(15),
        role: knowledgeBaseCustomResourceRole,
        layers: [dependencyLayer],
      }
    );

    const knowledgeBaseProvider = new Provider(this, "knowledgeBaseProvider", {
      onEventHandler: knowledgeBaseCustomResource,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const bedrockKnowledgeBase = new CustomResource(
      this,
      "KnowledgeBaseCustomResource",
      {
        serviceToken: knowledgeBaseProvider.serviceToken,
        properties: {
          namePrefix: "bedrock-knowledge-base",
          collectionEndpoint: openSearchServerless.attrCollectionEndpoint,
        },
      }
    );

    // const knowledgeBase = new CfnKnowledgeBase(this, "BedrockKnowledgebase", {
    //   name: KNOWLEDGE_BASE_NAME,
    //   description:
    //     "This knowladge base contains knowladge about the properties available in OMG booking details like emergency procedures, security, rules, utilities, decor, location, local area description and others",
    //   roleArn: bedrockExecutionRole.roleArn,
    //   knowledgeBaseConfiguration: {
    //     type: "VECTOR",
    //     vectorKnowledgeBaseConfiguration: {
    //       embeddingModelArn: embeddingModelArn,
    //     },
    //   },
    //   storageConfiguration: {
    //     type: "OPENSEARCH_SERVERLESS",
    //     opensearchServerlessConfiguration: {
    //       collectionArn: openSearchServerless.attrArn,
    //       vectorIndexName: VECTOR_STORE_NAME,
    //       fieldMapping: {
    //         vectorField: "vector",
    //         textField: "text",
    //         metadataField: "text-metadata",
    //       },
    //     },
    //   },
    // });

    // const dataSource = new CfnDataSource(this, "DataSource", {
    //   name: KNOWLEDGE_BASE_NAME,
    //   description: "Knowledgebase s3 datasource",
    //   knowledgeBaseId: knowledgeBase.attrKnowledgeBaseId,
    //   dataSourceConfiguration: {
    //     type: "S3",
    //     s3Configuration: {
    //       // TODO: create bucket here
    //       bucketArn: KB_BUCKET_ARN,
    //     },
    //   },
    //   vectorIngestionConfiguration: {
    //     chunkingConfiguration: {
    //       chunkingStrategy: "NONE",
    //       // fixedSizeChunkingConfiguration: {
    //       //   maxTokens: 512,
    //       //   overlapPercentage: 20,
    //       // },
    //     },
    //   },
    // });

    // new CfnOutput(this, 'KnowledgeBaseId', { value: this.knowledgeBase.knowledgeBaseId });
    // new CfnOutput(this, 'DataSourceId', { value: this.dataSource.dataSourceId });
    // new CfnOutput(this, 'DocumentBucket', { value: docBucket.bucketName });
  }
}
