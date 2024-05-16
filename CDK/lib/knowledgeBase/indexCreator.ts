import {
  CdkCustomResourceEvent,
  CdkCustomResourceResponse,
  Context,
} from "aws-lambda";
import { createIndex } from "./openSearchClient";

export const handler = async (
  event: CdkCustomResourceEvent,
  context: Context
): Promise<CdkCustomResourceResponse> => {
  console.info("event: ", event);
  const requestProperties = event.ResourceProperties;
  const requestType = event.RequestType;

  switch (requestType) {
    case "Create":
      await createIndex({
        host: requestProperties.collectionEndpoint!,
        namePrefix: requestProperties.namePrefix,
      });
    case "Update":
      await createIndex({
        host: requestProperties.collectionEndpoint!,
        namePrefix: requestProperties.namePrefix,
      });
    case "Delete":
      await createIndex({
        host: requestProperties.collectionEndpoint!,
        namePrefix: requestProperties.namePrefix,
      });
  }

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
