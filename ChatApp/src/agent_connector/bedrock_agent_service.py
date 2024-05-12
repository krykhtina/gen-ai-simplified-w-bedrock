import logging

import boto3

from agent_connector.bedrock_client_wrapper import BedrockAgentClientWrapper


class BedrockAgentService:

    def __init__(self, config):
        boto3_bedrock_client = boto3.client(
            service_name="bedrock-agent-runtime", region_name=config["region"]
        )
        self.agent_id = config["bedrock_agent_id"]
        self.agent_alias_id = config["bedrock_agent_alias_id"]
        self.bedrock_client = BedrockAgentClientWrapper(boto3_bedrock_client)

    def chat(self, session_id, prompt):
        logging.info(f"Session {session_id}, prompt: {prompt}")
        return self.bedrock_client.execute_request(self.agent_id, self.agent_alias_id, session_id, prompt)

    def end_chat(self, session_id):
        logging.info(f"End of session {session_id}")
        return self.bedrock_client.execute_request(self.agent_id, self.agent_alias_id, session_id, None, True)