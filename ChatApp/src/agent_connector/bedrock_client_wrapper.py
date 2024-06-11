import json
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

    def execute_request(self, agent_id, agent_alias_id, session_id, payload, end_session=False):
        """
        Sends a prompt for the agent to process and respond to.

        :param agent_id: The unique identifier of the agent to use.
        :param agent_alias_id: The alias of the agent to use.
        :param session_id: The unique identifier of the session. Use the same value across requests
                           to continue the same conversation.
        :param prompt: The prompt that you want the agent to complete.
        :param end_session: Boolean indicating whether to end the session.
        :return: Inference response from the model.
        """
        input_text = json.dumps(payload)
        logger.debug("Prompt: " + input_text)

        try:
            response = self.client.invoke_agent(
                agentId=agent_id,
                agentAliasId=agent_alias_id,
                sessionId=session_id,
                inputText=input_text,
                endSession=end_session,
                # enableTrace=True
            )

            logging.debug(f"\n Response from agent: {response}")

            completion = ""
            for event in response.get("completion", []):
                chunk = event["chunk"]
                completion += chunk["bytes"].decode()

        except ClientError as e:
            logger.error(f"Couldn't invoke agent. {e}")
            raise

        return completion
