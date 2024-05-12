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
            st.session_state.messages = []

        # Display chat messages from history on app rerun
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

        if prompt := st.chat_input("How can I help you today?"):
            st.session_state.messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)

            with st.chat_message("assistant"):
                stream = self.get_response(prompt, session_id)
                response = st.write(stream)
            st.session_state.messages.append({"role": "assistant", "content": response})

    def get_response(self, prompt, session_id):
        if prompt == "end":
            st.write("Thank you for using our service!")
            return self.agent_service.end_chat(session_id)

        if prompt:
            return self.agent_service.chat(session_id, prompt)


