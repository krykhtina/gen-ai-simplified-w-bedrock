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
  Stack,
  StackProps,
} from "aws-cdk-lib";
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

export interface OpenSearchStackProps extends StackProps {
  readonly namePrefix: string;
  readonly bucketArn: string;
}

export class OpenSearchStack extends Stack {
  readonly bedrockExecutionRole: Role;
  readonly openSearchCollection: CfnCollection;

  constructor(scope: Construct, id: string, props: OpenSearchStackProps) {
    super(scope, id, props);

    const embeddingModelArn =
      "arn:aws:bedrock:us-west-2::foundation-model/amazon.titan-embed-text-v1";
    const VECTOR_STORE_NAME = "os-vector-store";

    const encryptionPolicy = new CfnSecurityPolicy(
      this,
      `OpenSearchEncryptionPolicy`,
      {
        name: `${props.namePrefix}-encryption-policy`,
        description: "The encryption policy for the OpenSearch cluster",
        type: "encryption",
        policy: JSON.stringify({
          Rules: [
            {
              ResourceType: "collection",
              Resource: [`collection/${props.namePrefix}-${VECTOR_STORE_NAME}`],
            },
          ],
          AWSOwnedKey: true,
        }),
      }
    );

    this.openSearchCollection = new CfnCollection(this, `${props.namePrefix}-os-collection`, {
      name: `${props.namePrefix}-${VECTOR_STORE_NAME}`,
      type: "VECTORSEARCH",
    });

    this.openSearchCollection.addDependency(encryptionPolicy);

    const knowledgeBaseCustomResourceRole = new Role(
      this,
      'knowledgeBaseCustomResourceRole',
      {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        inlinePolicies: {
          ['bedrockPolicy']: new PolicyDocument({
            statements: [
              new PolicyStatement({
                resources: ['*'],
                actions: [
                  'bedrock:*KnowledgeBase',
                  'bedrock:*DataSource',
                  'iam:PassRole',
                ],
              }),
            ],
          }),
          ['aossPolicy']: new PolicyDocument({
            statements: [
              new PolicyStatement({
                resources: ['*'],
                actions: ['aoss:*', 'iam:CreateServiceLinkedRole'],
              }),
            ],
          }),
        },
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole',
          ),
        ],
      },
    );

    this.bedrockExecutionRole = new Role(this, "BedrockExecutionRole", {
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
              resources: [props.bucketArn, `${props.bucketArn}/*`],
            }),
          ],
        }),
        OpenSearchPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['aoss:*'],
              resources: ["*"],
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
          namePrefix: props.namePrefix,
          collectionEndpoint: this.openSearchCollection.attrCollectionEndpoint,
          knowledgeBaseCustomResourceRole: knowledgeBaseCustomResourceRole.roleArn,
          knowledgeBaseRole: this.bedrockExecutionRole.roleArn
        },
      }
    );
  }
}
