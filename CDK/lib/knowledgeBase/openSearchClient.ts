import { Client } from "@opensearch-project/opensearch/.";
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

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
