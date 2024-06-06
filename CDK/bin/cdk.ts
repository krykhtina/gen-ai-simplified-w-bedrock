#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { OpenSearchStack } from "../lib/open-search-stack";
import { KnowledgeBaseStack } from "../lib/knowladge-base-stack";
import { BedrockAgentStack } from "../lib/bedrock-agent-stack";
import { ActionGroupStack } from "../lib/action-group-stack";

const environment = {
  account: "879331023346",
  region: "us-west-2",
};

const bucketArn = "arn:aws:s3:::omg-properties-knowladge";
const embeddingModelArn =
      "arn:aws:bedrock:us-west-2::foundation-model/amazon.titan-embed-text-v1";

const app = new cdk.App();

function getStackId(stackName: string) {
  return `${stackName}-GenAISimplified-${environment.account}-${environment.region}`;
}

const openSearchStack = new OpenSearchStack(app, getStackId("OpenSearchStack"), {
  env: environment,
  namePrefix: "knowledge-base",
  bucketArn: bucketArn
});

const knowledgeBaseStack = new KnowledgeBaseStack(app, getStackId("KnowledgeBaseStack"), {
  env: environment,
  namePrefix: "knowledge-base",
  bucketArn: bucketArn,
  embeddingModelArn: embeddingModelArn,
  bedrockExecutionRole: openSearchStack.bedrockExecutionRole,
  openSearchCollection: openSearchStack.openSearchCollection
});

const actionGroupStack = new ActionGroupStack(app, getStackId("ActionGroupStack"), {
  env: environment,
});

new BedrockAgentStack(app, getStackId("BedrockAgentStack"), {
  env: environment,
  namePrefix: "gen-ai",
  knowledgeBaseId: knowledgeBaseStack.knowledgeBaseId,
  actionGroupProperties: actionGroupStack.actionGroupProperties,
  actionGroupSchemaArn: actionGroupStack.actionGroupSchemaArn
});
