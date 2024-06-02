import uuid
import random
import streamlit as st
from agent_connector.bedrock_agent_service import BedrockAgentService
from streamlit_app.prompt_engineering import RandomAssistant

# Dialog-related Constants
END_PROMPT = "end"
APP_TITLE = "Your amazing Booking app"
# User-related constants
USER_ROLE = "user"
USER_AVATAR = "🧑"

class BookingApp:
    def __init__(self):
        self.config = self.load_config()
        self.agent_service = BedrockAgentService(self.config)
        self.session_id = str(uuid.uuid4())
        self.initialize_assistant()
        self.initialize_session()

    def load_config(self):
        """Load configuration from Streamlit secrets."""
        return {
            "bedrock_agent_id": st.secrets["bedrock_agent_id"],
            "bedrock_agent_alias_id": st.secrets["bedrock_agent_alias_id"],
            "region": st.secrets["region"]
        }

    def initialize_assistant(self):
        """Initialize the assistant and store it in the session state if not already done."""
        if "assistant" not in st.session_state:
            st.session_state["assistant"] = RandomAssistant()

    def get_assistant(self):
        """Get the assistant from the session state."""
        return st.session_state["assistant"]

    def initialize_session(self):
        """Initialize the chat session state."""
        if "messages" not in st.session_state:
            assistant = self.get_assistant()
            st.session_state["messages"] = [
                {"role": assistant.get_assistant_role(), "content": assistant.get_assistant_intro()}
            ]

    def display_chat_history(self):
        """Display the chat messages from history."""
        assistant = self.get_assistant()
        for message in st.session_state["messages"]:
            avatar = USER_AVATAR if message["role"] == USER_ROLE else assistant.get_assistant_avatar()
            with st.chat_message(message["role"], avatar=avatar):
                st.markdown(message["content"])

    def handle_user_input(self):
        """Handle the user input and get the response from the assistant."""
        assistant = self.get_assistant()
        if prompt := st.chat_input():
            # Display user's message
            with st.chat_message(USER_ROLE, avatar=USER_AVATAR):
                st.markdown(prompt)
                st.session_state["messages"].append({"role": USER_ROLE, "content": prompt})

            # Get assistant response
            thinking_message = assistant.get_thinking_message()
            with st.chat_message(assistant.get_assistant_role(), avatar=assistant.get_assistant_avatar()):
                with st.spinner(thinking_message):
                    response = self.get_response(prompt)
                st.markdown(response)
                st.session_state["messages"].append({"role": assistant.get_assistant_role(), "content": response})

    def add_message(self, role, content):
        """Add a message to the chat history."""
        st.session_state["messages"].append({"role": role, "content": content})

    def get_response(self, prompt):
        """Get the response from the Bedrock agent service."""
        assistant = self.get_assistant()
        if prompt.lower() == END_PROMPT:
            end_message = assistant.get_assistant_end_message()
            st.write(end_message)
            return self.agent_service.end_chat(self.session_id, st.session_state["messages"])

        # Randomly select a prompt instruction specific to the assistant
        instruction = random.choice(assistant.get_assistant_instructions())

        # Combine the instruction with the user's prompt
        engineered_prompt = f"\n{prompt}. \n {instruction}"

        # Pass the full conversation history and engineered prompt to the agent service
        return self.agent_service.chat(self.session_id, engineered_prompt, st.session_state["messages"], assistant.get_assistant_role())

    def launch(self):
        """Launch the Streamlit app."""
        st.title(APP_TITLE)
        self.display_chat_history()
        self.handle_user_input()

# Run the app
if __name__ == "__main__":
    app = BookingApp()
    app.launch()
