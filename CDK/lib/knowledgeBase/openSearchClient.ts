import { Client } from "@opensearch-project/opensearch";
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import {
  CreateAccessPolicyCommand,
  OpenSearchServerlessClient,
} from "@aws-sdk/client-opensearchserverless";
import { randomUUID } from "crypto";

const AWS_REGION = "us-west-2";

interface CreateIndexParams {
  host: string;
  namePrefix: string;
}
export const createIndex = async (params: CreateIndexParams) => {
  const { host, namePrefix } = params;
  console.log("Creating Index");
  await new Promise((resolve) => setTimeout(resolve, 60000));

  const client = new Client({
    ...AwsSigv4Signer({
      region: AWS_REGION!,
      service: "aoss",
      getCredentials: () => {
        const credentialsProvider = defaultProvider();
        return credentialsProvider();
      },
    }),
    node: host,
  });

  console.log(JSON.stringify(client));

  try {
    var createIndexResponse = await client.indices.create({
      index: `${namePrefix}-knowledge-base-index`,
      body: {
        settings: {
          "index.knn": true,
        },
        mappings: {
          properties: {
            [`${namePrefix}-vector`]: {
              type: "knn_vector",
              dimension: 1536,
              method: {
                name: "hnsw",
                engine: "faiss",
                parameters: {
                  ef_construction: 512,
                  m: 16,
                },
              },
            },
          },
        },
      },
    });

    console.log(JSON.stringify(createIndexResponse.body, null, 2));
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
  }
};

interface CreateAccessPolicyParams {
  namePrefix: string;
  knowledgeBaseRoleArn: string;
  knowledgeBaseCustomResourceRole: string;
  accessPolicyArns: string;
}

export const createAccessPolicy = async (params: CreateAccessPolicyParams) => {
  console.log("Creating AccessPolicy");
  const {
    namePrefix,
    knowledgeBaseRoleArn,
    knowledgeBaseCustomResourceRole,
    accessPolicyArns,
  } = params;

  const parsedArns: string[] = JSON.parse(accessPolicyArns);
  const principalArray = [
    ...parsedArns,
    knowledgeBaseRoleArn,
    knowledgeBaseCustomResourceRole,
  ];

  const policy = [
    {
      Rules: [
        {
          Resource: [`collection/${namePrefix}`],
          Permission: [
            "aoss:DescribeCollectionItems",
            "aoss:CreateCollectionItems",
            "aoss:UpdateCollectionItems",
          ],
          ResourceType: "collection",
        },
        {
          Resource: [`index/${namePrefix}-/*`],
          Permission: [
            "aoss:UpdateIndex",
            "aoss:DescribeIndex",
            "aoss:ReadDocument",
            "aoss:WriteDocument",
            "aoss:CreateIndex",
          ],
          ResourceType: "index",
        },
      ],
      Principal: principalArray,
      Description: "",
    },
  ];

  console.log(`Access Policy: ${JSON.stringify(policy, null, 2)}`);
  try {
    const openSearchServerlessClient = new OpenSearchServerlessClient({
      region: AWS_REGION,
    });

    const data = await openSearchServerlessClient.send(
      new CreateAccessPolicyCommand({
        clientToken: randomUUID(),
        name: `${namePrefix}`,
        type: "data",
        policy: JSON.stringify(policy),
      })
    );
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
    }
  }
  throw new Error("Failed to create AccessPolicy");
};
