import logging

from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class BedrockAgentClientWrapper:
    """Encapsulates Agents for Amazon Bedrock Runtime actions."""

    def __init__(self, client):
        """
        :param client: A low-level client representing the Agents for Amazon
                               Bedrock Runtime. Describes the API operations for running
                               inferences using Bedrock Agents.
        """
        self.client = client

    def execute_request(self, agent_id, agent_alias_id, session_id, prompt, message_history: list[dict], end_session=False):
        """
        Sends a prompt for the agent to process and respond to.

        :param agent_id: The unique identifier of the agent to use.
        :param agent_alias_id: The alias of the agent to use.
        :param session_id: The unique identifier of the session. Use the same value across requests
                           to continue the same conversation.
        :param prompt: The prompt that you want the agent to complete.
        :param message_history: List of dictionaries representing the conversation history.
        :param end_session: Boolean indicating whether to end the session.
        :return: Inference response from the model.
        """

        # Combine message history and the current prompt
        formatted_conversation = self.format_conversation(message_history, prompt)

        try:
            response = self.client.invoke_agent(
                agentId=agent_id,
                agentAliasId=agent_alias_id,
                sessionId=session_id,
                inputText=prompt,
                endSession=end_session,
                # enableTrace=True
            )

            completion = ""

            for event in response.get("completion"):
                chunk = event["chunk"]
                completion = completion + chunk["bytes"].decode()

        except ClientError as e:
            logger.error(f"Couldn't invoke agent. {e}")
            raise

        return completion

    @staticmethod
    def format_conversation(message_history, prompt):
        """
        Formats the conversation history and the current prompt into a single string.

        :param message_history: List of dictionaries representing the conversation history.
        :param prompt: The current user prompt.
        :return: A formatted string representing the entire conversation.
        """
        conversation = "A message context:\n"
        for message in message_history:
            role = message["role"]
            content = message["content"]
            conversation += f"{role}: {content}\n"

        conversation += "A new prompt:\n"
        conversation += f"user: {prompt}\n"
        return conversation

