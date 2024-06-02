import logging

import boto3

from agent_connector.bedrock_client_wrapper import BedrockAgentClientWrapper


class BedrockAgentService:
    """
    This class provides a service for interacting with the Bedrock Agent Runtime.
    """

    def __init__(self, config):
        """
        Initializes the BedrockAgentService with the necessary configuration.
        Args:
            config (dict): A dictionary containing the configuration parameters, including the region, Bedrock Agent ID, and Bedrock Agent Alias ID.
        """
        boto3_bedrock_client = boto3.client(
            service_name="bedrock-agent-runtime", region_name=config["region"]
        )
        self.agent_id = config["bedrock_agent_id"]
        self.agent_alias_id = config["bedrock_agent_alias_id"]
        self.bedrock_client = BedrockAgentClientWrapper(boto3_bedrock_client)

    def chat(self, session_id, prompt: str, message_history: list[dict]):
        """
        Executes a chat request with the Bedrock Agent.
        Args:
            session_id (str): The unique identifier for the chat session.
            prompt (str): The user's prompt for the chat.
            message_history (list[dict]): A list of previous messages in the chat session.
        Returns:
            The response from the Bedrock Agent.
        """
        logging.info(f"Session {session_id}, prompt: {prompt}")
        return self.bedrock_client.execute_request(self.agent_id, self.agent_alias_id, session_id, prompt,
                                                   message_history)

    def end_chat(self, session_id):
        """
        Ends the chat session with the Bedrock Agent.
        Args:
            session_id (str): The unique identifier for the chat session.
        Returns:
            The response from the Bedrock Agent.
        """
        logging.info(f"End of session {session_id}")
        return self.bedrock_client.execute_request(self.agent_id, self.agent_alias_id, session_id, None, True)
