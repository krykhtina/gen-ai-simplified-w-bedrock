import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { CfnDataSource, CfnKnowledgeBase } from "aws-cdk-lib/aws-bedrock";
import { Role } from "aws-cdk-lib/aws-iam";
import { CfnCollection } from "aws-cdk-lib/aws-opensearchserverless";
import { Construct } from "constructs";

export interface KnowledgeBaseStackProps extends StackProps {
  readonly namePrefix: string;
  readonly bucketArn: string;
  readonly embeddingModelArn: string;
  readonly bedrockExecutionRole: Role;
  readonly openSearchCollection: CfnCollection;
}

export class KnowledgeBaseStack extends Stack {
  readonly knowledgeBaseId: string;

    constructor(scope: Construct, id: string, props: KnowledgeBaseStackProps) {
      super(scope, id, props);
      const KNOWLEDGE_BASE_NAME = "bedrock-agent-knowladge-base"


      const knowledgeBase = new CfnKnowledgeBase(this, "BedrockKnowledgebase", {
        name: KNOWLEDGE_BASE_NAME,
        description:
          "This knowladge base contains knowladge about the properties available in OMG booking details like emergency procedures, security, rules, utilities, decor, location, local area description and others",
        roleArn: props.bedrockExecutionRole.roleArn,
        knowledgeBaseConfiguration: {
          type: "VECTOR",
          vectorKnowledgeBaseConfiguration: {
            embeddingModelArn: props.embeddingModelArn,
          },
        },
        storageConfiguration: {
          type: "OPENSEARCH_SERVERLESS",
          opensearchServerlessConfiguration: {
            collectionArn: props.openSearchCollection.attrArn,
            vectorIndexName: `${props.namePrefix}-index`,
            fieldMapping: {
              vectorField: `${props.namePrefix}-vector`,
              textField: "text",
              metadataField: "text-metadata",
            },
          },
        },
      });

      this.knowledgeBaseId = knowledgeBase.attrKnowledgeBaseId;
  
      const dataSource = new CfnDataSource(this, "DataSource", {
        name: KNOWLEDGE_BASE_NAME,
        description: "Knowledgebase s3 datasource",
        knowledgeBaseId: knowledgeBase.attrKnowledgeBaseId,
        dataSourceConfiguration: {
          type: "S3",
          s3Configuration: {
            // TODO: create bucket here
            bucketArn: props.bucketArn,
          },
        },
        vectorIngestionConfiguration: {
          chunkingConfiguration: {
            chunkingStrategy: "NONE",
            fixedSizeChunkingConfiguration: {
              maxTokens: 300,
              overlapPercentage: 20,
            },
          },
        },
      });
  
      new CfnOutput(this, 'KnowledgeBaseId', { value: knowledgeBase.attrKnowledgeBaseId });
      new CfnOutput(this, 'DataSourceId', { value: dataSource.attrDataSourceId });
      new CfnOutput(this, 'DocumentBucket', { value: "omg-properties-knowladge" });
    }
}