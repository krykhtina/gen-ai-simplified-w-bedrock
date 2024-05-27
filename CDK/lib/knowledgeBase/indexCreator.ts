import {
  CdkCustomResourceEvent,
  CdkCustomResourceResponse,
  Context,
} from "aws-lambda";
import { createAccessPolicy, createIndex, createNetworkSecurityPolicy } from "./openSearchClient";

export const handler = async (
  event: CdkCustomResourceEvent,
  context: Context
): Promise<CdkCustomResourceResponse> => {
  console.info("event: ", event);
  const requestProperties = event.ResourceProperties;
  const requestType = event.RequestType;

  switch (requestType) {
    case "Create":
      createAccessPolicy({
        namePrefix: requestProperties.namePrefix,
        knowledgeBaseCustomResourceRole: requestProperties.knowledgeBaseCustomResourceRole,
        knowledgeBaseRole: requestProperties.knowledgeBaseRole
      });
      createNetworkSecurityPolicy({
        namePrefix: requestProperties.namePrefix,
      })
      await createIndex({
        host: requestProperties.collectionEndpoint!,
        namePrefix: requestProperties.namePrefix,
        knowledgeBaseCustomResourceRole: requestProperties.knowledgeBaseCustomResourceRole,
        knowledgeBaseRole: requestProperties.knowledgeBaseRole
      });
  }
  console.log("exited switch")

  let response: CdkCustomResourceResponse = {};

  response.Status = "SUCCESS";
  response.Reason = "createIndex successful";
  response.StackId = event.StackId;
  response.RequestId = event.RequestId;
  response.LogicalResourceId = event.LogicalResourceId;
  response.PhysicalResourceId = context.logGroupName;

  console.log(`Response: ${JSON.stringify(response)}`);
  return response;
};
