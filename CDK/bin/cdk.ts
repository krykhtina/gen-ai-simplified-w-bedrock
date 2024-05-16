#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/dynamo-db-stack";
import { BedrockKnowledgeBaseStack } from "../lib/bedrock-knowledgebase-stack";

const environment = {
  account: "879331023346",
  region: "us-west-2",
};

const app = new cdk.App();

function getStackId(stackName: string) {
  return `${stackName}-GenAISimplified-${environment.account}-${environment.region}`;
}

new DynamoDbStack(app, getStackId("DynamoDbStack"), {
  env: environment,
});

new BedrockKnowledgeBaseStack(app, getStackId("KnowledgeBaseStack"), {
  env: environment,
});
