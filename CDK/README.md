# CDK Project for Hotel Booking Assistant

This project leverages AWS CDK (Cloud Development Kit) to deploy an infrastructure for a hotel booking assistant powered by Amazon Bedrock and various AWS services. The project is organized into multiple stacks to manage different components such as Bedrock Agent, DynamoDB, Knowledge Base, and OpenSearch.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`  deploy this stack to your default AWS account/region
* `cdk diff`    compare deployed stack with current state
* `cdk synth`   emits the synthesized CloudFormation template

### AWS Configuration:

Ensure that your AWS credentials are configured. You can set them up using the AWS CLI:

```sh
aws configure
```

Alternatively, you can set the environment variables:

```sh
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_DEFAULT_REGION=your_region
```

## Install dependencies:

```sh
npm install
```

## Deploying the Stacks

### Bootstrap your AWS environment:

```sh
cdk bootstrap
```

### Deploy the DynamoDB Stack:

```sh
cdk deploy --all
```

## Stack Details
### DynamoDB Stack (dynamo-db-stack.js)

This stack sets up the DynamoDB tables required for storing user data, session information, and other necessary details.

### Bedrock Agent Stack (bedrock-agent-stack.ts)

This stack deploys the Amazon Bedrock agent, which handles the natural language processing and conversation management for the hotel booking assistant.

### Knowledge Base Stack (knowledge-base-stack.ts)

This stack deploys the infrastructure for the knowledge base, which includes resources needed to store and retrieve information relevant to the assistant's responses.

### OpenSearch Stack (open-search-stack.ts)

This stack deploys the OpenSearch service, enabling advanced search capabilities for the knowledge base.

## Usage

Once all stacks are deployed, the hotel booking assistant should be operational. You can interact with the assistant through the frontend application, which utilizes the deployed backend services.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any issues or questions, please open an issue in the repository or contact our team:

- alexa.krykhtina@gmail.com
- anadabrowska98@gmail.com
