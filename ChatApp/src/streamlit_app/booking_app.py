import uuid
import streamlit as st
from agent_connector.bedrock_agent_service import BedrockAgentService


class BookingApp:

    def __init__(self):
        config = {
            "bedrock_agent_id": st.secrets["bedrock_agent_id"],
            "bedrock_agent_alias_id": st.secrets["bedrock_agent_alias_id"],
            "region": st.secrets["region"]
        }
        self.agent_service = BedrockAgentService(config)

    def launch(self):
        st.title("OMG Booking")
        session_id = str(uuid.uuid4())

        # Initialize chat history
        if "messages" not in st.session_state:
            st.session_state["messages"] = [{"role": "assistant", "content": "How can I help you?"}]

        # Display chat messages from history on app rerun
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

        if prompt := st.chat_input():
            # Add user message to chat history
            with st.chat_message("user"):
                st.markdown(prompt)
                st.session_state.messages.append({"role": "user", "content": prompt})

            # Get assistant response
            with st.chat_message("assistant"):
                with st.spinner('Thinking...'):
                    response = self.get_response(prompt, session_id, st.session_state["messages"])
                st.markdown(response)
                st.session_state.messages.append({"role": "assistant", "content": response})

    def get_response(self, prompt, session_id, messages):
        if prompt == "end":
            st.write("Thank you for using our service!")
            return self.agent_service.end_chat(session_id)

        if prompt:
            # Pass the full conversation history to the agent service
            return self.agent_service.chat(session_id, prompt, messages)


# Run the app
if __name__ == "__main__":
    app = BookingApp()
    app.launch()
