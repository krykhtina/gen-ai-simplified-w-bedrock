#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { OpenSearchStack } from "../lib/open-search-stack";
import { KnowledgeBaseStack } from "../lib/knowladge-base-stack";

const environment = {
  account: "879331023346",
  region: "us-west-2",
};

const namePrefix = "knowledge-base";
const bucketArn = "arn:aws:s3:::omg-properties-knowladge";
const embeddingModelArn =
      "arn:aws:bedrock:us-west-2::foundation-model/amazon.titan-embed-text-v1";

const app = new cdk.App();

function getStackId(stackName: string) {
  return `${stackName}-GenAISimplified-${environment.account}-${environment.region}`;
}

const openSearchStack = new OpenSearchStack(app, getStackId("OpenSearchStack"), {
  env: environment,
  namePrefix: namePrefix,
  bucketArn: bucketArn
});

new KnowledgeBaseStack(app, getStackId("KnowledgeBaseStack"), {
  env: environment,
  namePrefix: namePrefix,
  bucketArn: bucketArn,
  embeddingModelArn: embeddingModelArn,
  bedrockExecutionRole: openSearchStack.bedrockExecutionRole,
  openSearchCollection: openSearchStack.openSearchCollection
});
