import logging
import re
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

    def chat(self, session_id, prompt: dict):
        """
        Executes a chat request with the Bedrock Agent.
        Args:
            session_id (str): The unique identifier for the chat session.
            prompt (str): The user's prompt for the chat.
        Returns:
            The response from the Bedrock Agent.
        """
        logging.info(f"Session {session_id}, prompt: {prompt}")
        response = self.bedrock_client.execute_request(self.agent_id, self.agent_alias_id, session_id, prompt)
        return self.cleanup_haiku_response(response)

    def cleanup_haiku_response(self, response):
        response = self.replace_placeholders(response)
        return self.extract_response(response)

    @staticmethod
    def extract_response(text):
        # Define the regular expression pattern to match content within <response> tags
        pattern = r'<response>(.*?)</response>'

        # Search for the pattern in the text
        match = re.search(pattern, text, re.DOTALL)

        # If a match is found, return the content within the tags, otherwise return the original text
        if match:
            return match.group(1).strip()
        else:
            return text

    @staticmethod
    def replace_placeholders(response):
        return response.replace("<REDACTED>", "Booking")

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
