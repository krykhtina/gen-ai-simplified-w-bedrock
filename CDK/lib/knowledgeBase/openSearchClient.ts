import { Client } from "@opensearch-project/opensearch";
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import {
  CreateAccessPolicyCommand,
  CreateSecurityPolicyCommand,
  OpenSearchServerlessClient,
} from "@aws-sdk/client-opensearchserverless";
import { randomUUID } from "crypto";

const AWS_REGION = "us-west-2";

interface CreateIndexParams {
  host: string;
  namePrefix: string;
  knowledgeBaseCustomResourceRole: string;
  knowledgeBaseRole: string;
}
export const createIndex = async (params: CreateIndexParams) => {
  const { host, namePrefix, knowledgeBaseCustomResourceRole, knowledgeBaseRole } = params;
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
      index: `${namePrefix}-index`,
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
    console.log("Succesfully created index")
    console.log(JSON.stringify(createIndexResponse.body, null, 2));
  } catch (error) {
    console.log("Index creation failed")
    console.error(JSON.stringify(error, null, 2));
  }
};

interface CreateAccessPolicyParams {
  namePrefix: string;
  knowledgeBaseCustomResourceRole: string;
  knowledgeBaseRole: string;
}

export const createAccessPolicy = async (params: CreateAccessPolicyParams) => {
  console.log("Creating AccessPolicy");
  const {
    namePrefix,
    knowledgeBaseCustomResourceRole,
    knowledgeBaseRole
  } = params;

  const parsedArns: string[] = JSON.parse(JSON.stringify([]));
  const principalArray = [
    ...parsedArns,
    knowledgeBaseCustomResourceRole,
    knowledgeBaseRole
  ];

  const policy = [
    {
      Rules: [
        {
          Resource: [`collection/${namePrefix}-os-vector-store`],
          Permission: [
            "aoss:DescribeCollectionItems",
            "aoss:CreateCollectionItems",
            "aoss:UpdateCollectionItems",
          ],
          ResourceType: "collection",
        },
        {
          Resource: [`index/${namePrefix}-os-vector-store/*`],
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
        name: `${namePrefix}-data-policy`,
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


interface CreateNetworkSecurityPolicyParams {
  namePrefix: string;
}

export const createNetworkSecurityPolicy = async (
  params: CreateNetworkSecurityPolicyParams,
) => {
  console.log('Creating Network SecurityPolicy');
  const { namePrefix } = params;
  try {
    const openSearchServerlessClient = new OpenSearchServerlessClient({
      region: AWS_REGION,
    });

    const policy = [
      {
        AllowFromPublic: true,
        Rules: [
          {
            ResourceType: 'dashboard',
            Resource: [`collection/${namePrefix}-os-vector-store`],
          },
          {
            ResourceType: 'collection',
            Resource: [`collection/${namePrefix}-os-vector-store`],
          },
        ],
      },
    ];
    const data = await openSearchServerlessClient.send(
      new CreateSecurityPolicyCommand({
        clientToken: randomUUID(),
        name: `${namePrefix}-col-policy`,
        type: 'network',
        policy: JSON.stringify(policy),
      }),
    );
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
    }
    throw new Error('Failed to create SecurityPolicy');
  }
};
