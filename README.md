# Demystifying Generative AI: While Others Talk, Do It with Amazon Bedrock

> This is a project prepared for the purpose of the workshop: "Demystifying Generative AI: While Others Talk, Do It with Amazon Bedrock" led by Amazon Development Center Poland.


## Project description
This project contains an implementation of the "OMG booking Chatbot". The chatbot is responsible for proving knowladge about rental properties, details like emergency procedures, security, rules, utilities, decor, location, local area description and others. It can also assist the user with booking prcedures by checking the avalability and making the final reservation. It is characterized to act as a British buttler to enhance the experience and make it more interesting. 

Project consists of three parts: 
- Infrastructure (CDK) - We use CDK, infrastructure as code, to provide all the necessary infrastructure elements like: knowladge base, action group, agent and necessary permissions. Building it this way makes the project more reliable but albo a bit more difficult so later we provide resoures explaining how to do it using AWS Console.
- Booking API - an implementation of the api responsible for booking. It's separarated from the rest of the project as the Agent architecture allows you to use any API (for e.g. some open source APIs) so we decided to build it in separation
- Chat App - frontend part of the project build using Streamlit. Here we build the chat initerface and using prompt engineering we give our assistant a character of a British buttler 


## Setup
### Prerequisites
- AWS CDK Toolkit (cdk command)

        `npm install -g aws-cdk`
- Python 3.x
- pip (Python package installer)
- pipenv (Python dependency manager)
- AWS account with necessary permissions to use Bedrock API
    - [Setup free AWS Account](https://aws.amazon.com/free/?gclid=EAIaIQobChMI4dr3-tLVhgMVOguiAx2JZQFyEAAYASAAEgJ_evD_BwE&trk=9ab5159b-247d-4917-a0ec-ec01d1af6bf9&sc_channel=ps&ef_id=EAIaIQobChMI4dr3-tLVhgMVOguiAx2JZQFyEAAYASAAEgJ_evD_BwE:G:s&s_kwcid=AL!4422!3!645133561110!e!!g!!create%20aws%20account!19579657595!152087369744&all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=*all&awsf.Free%20Tier%20Categories=*all)
    - [Bderock model access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html#:~:text=To%20request%20access%20to%20a%20model&text=Select%20model%20group%20by%20provider,box%20next%20to%20the%20provider.)
    - [Set up the Amazon Bedrock API](https://docs.aws.amazon.com/bedrock/latest/userguide/api-setup.html)

Clone the repository:

```sh
git clone https://github.com/krykhtina/gen-ai-simplified-w-bedrock.git
cd gen-ai-simplified-w-bedrock/ChatApp
```

### Create Agent:
Enter CDK folder
```sh
cd CDK
```

Install dependencies
```sh
npm install
```

Compile typescript to javascript
```sh
npm run build
```
**Important!** 

>Before the  next step configure AWS accoring to AWS Configuration section and make sure you enabled model access in Bedrock

Deploy the infrastructure
```sh
cdk deploy all
```
    
### Setup ChatApp:
Enter chatApp folder
```sh
cd ChatApp
```

Install pipenv if you haven't already:

```sh
pip install pipenv
```

Install dependencies:

```sh
pipenv install
```


## Useful CDK commands

* `npm run build`   compile typescript to js
* `cdk deploy <stack-name>`    deploy selected stack to your default AWS account/region
* `cdk deploy all` deploy all the stacksto your default AWS account/region
* `cdk diff` compare deployed stack with current state
* `cdk synth` emits the synthesized CloudFormation template


## Configuration

1. **AWS Configuration:**

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

2. **Application Configuration:**

    Create a configuration file `.streamlit/secrets.toml` in the root directory of your project with the necessary settings:

    ```toml
    region="your_region"
    bedrock_agent_id="your_bedrock_agent_id"
    bedrock_agent_alias_id="bedrock_agent_alias_id"
    ```

## Usage

1. Run the Streamlit application in the root folder (`ChatApp`):

    ```sh
    streamlit run src/app.py
    ```

2. Open your web browser and navigate to `http://localhost:8501` to access the application.

3. Use the interface to interact with the Bedrock API.

## License

This project is licensed under the MIT License.

## Contact

For any issues or questions, please open an issue in the repository or contact our team:

- alexa.krykhtina@gmail.com
- anadabrowska98@gmail.com
