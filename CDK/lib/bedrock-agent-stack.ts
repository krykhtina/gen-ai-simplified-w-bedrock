import { Stack, StackProps, aws_iam } from "aws-cdk-lib";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { CfnAgent, CfnAgentAlias } from "aws-cdk-lib/aws-bedrock";
import { resolve } from 'path';
import { readFileSync } from "fs";

export interface BedrockAgentStackProps extends StackProps {
    readonly namePrefix: string;
    readonly knowledgeBaseId: string;
  }

export class BedrockAgentStack extends Stack {

    constructor(scope: Construct, id: string, props: BedrockAgentStackProps) {
        super(scope, id, props)


    // https://docs.aws.amazon.com/bedrock/latest/userguide/agents-permissions.html
    const agentIamRole = new Role(this, `${props.namePrefix}-bedrock-agent-role`, {
      // The role name has to start with AmazonBedrockExecutionRoleForAgents_ as per
      // https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent_Agent.html
      // see also: https://sage.amazon.dev/posts/1793211
      roleName: `${props.namePrefix}-agent-role`,
      assumedBy: new aws_iam.ServicePrincipal('bedrock.amazonaws.com', {
        conditions: {
          StringEquals: {
            'aws:SourceAccount': 879331023346,
          },
          ArnLike: {
            'aws:SourceArn': `arn:aws:bedrock:us-west-2:879331023346:agent/*`,
          },
        },
      }),
      inlinePolicies: {
        LLMInvocationPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['bedrock:InvokeModel'],
              resources: [
                `arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
                `arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`,
              ],
            }),
          ],
        }),
        KnowledgeBasePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['bedrock:Retrieve', 'bedrock:RetrieveAndGenerate'],
              resources: [`arn:aws:bedrock:us-west-2:879331023346:knowledge-base/*`],
            }),
          ],
        }),
      },
    });

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_bedrock.CfnAgent.html
    const agent = new CfnAgent(this, `${props.namePrefix}-bedrock-agent`, {
      agentName: 'AssistantDriverAgent',
      agentResourceRoleArn: agentIamRole.roleArn,
      foundationModel: 'anthropic.claude-3-haiku-20240307-v1:0',

      // Optional props
      autoPrepare: true,
      // description: readFileSync(resolve('lib/prompts/description.txt'), 'utf-8'),
      idleSessionTtlInSeconds: 3600,
      instruction: readFileSync(resolve('lib/prompts/instruction.txt'), 'utf-8'),
      knowledgeBases: [
        {
          description:
            'Knowladge base contains knowladge about the properties available in OMG booking details like emergency procedures, security, rules, utilities, decor, location, local area description and others.',
          knowledgeBaseId: `${props.knowledgeBaseId}`,
          knowledgeBaseState: 'ENABLED',
        },
      ],
    });

    const agentAlias = new CfnAgentAlias(this,  `${props.namePrefix}-bedrock-agent-alias`, {
      agentAliasName: `${props.namePrefix}-agent-alias`,
      agentId: agent.attrAgentId,
      description: `Alias for driver agent - ${new Date().toDateString()}`,
    });
    // Ensure agent is fully stabilized before updating the alias
    agentAlias.node.addDependency(agent);
  }
}