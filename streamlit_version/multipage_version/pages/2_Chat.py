
import streamlit as st
from streamlit_chat import message
import time

st.set_page_config(
    page_title="ChatPDF - Chat",
    page_icon="💬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Ensure session state values exist
if "pdf_file" not in st.session_state or st.session_state.pdf_file is None:
    st.warning("Please upload a PDF on the Home page first")
    st.stop()

if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []

# Function to simulate AI responses
def get_ai_response(query):
    responses = [
        "That's an interesting point in the document. Let me elaborate...",
        "Based on the PDF content, I can tell you that...",
        "The document suggests several key points related to your question...",
        "According to the PDF, the main concept here is...",
        "I found related information on page 3 that addresses your question..."
    ]
    import random
    return random.choice(responses) + " This is a simulated response based on your query: " + query

# Sidebar for showing current document and options
with st.sidebar:
    st.title("ChatPDF - Chat")
    st.subheader("Current Document")
    st.text(st.session_state.pdf_file["name"])
    
    if st.button("New Chat"):
        st.session_state.chat_messages = []
        st.experimental_rerun()

# Main chat interface
st.title("Chat with your PDF")

# Display chat messages
chat_container = st.container()
with chat_container:
    if not st.session_state.chat_messages:
        st.info("Ask questions about your document!")
        
        # Sample suggestions
        st.subheader("Suggested Questions")
        suggestions = [
            "What's the main topic of this document?",
            "Can you summarize page 1?",
            "Explain the key points in this PDF",
            "What are the conclusions in this document?"
        ]
        
        for suggestion in suggestions:
            if st.button(suggestion, key=suggestion):
                # Add user message
                st.session_state.chat_messages.append({"sender": "user", "text": suggestion})
                # Simulate AI thinking
                with st.spinner("Thinking..."):
                    time.sleep(1)
                # Add AI response
                ai_response = get_ai_response(suggestion)
                st.session_state.chat_messages.append({"sender": "ai", "text": ai_response})
                st.experimental_rerun()
    else:
        # Display existing messages
        for i, chat_message in enumerate(st.session_state.chat_messages):
            if chat_message["sender"] == "user":
                message(chat_message["text"], is_user=True, key=f"msg_{i}")
            else:
                message(chat_message["text"], is_user=False, key=f"msg_{i}")

# Chat input
st.markdown("---")
user_question = st.text_input("Ask about the document")

if st.button("Send", type="primary") and user_question:
    # Add user message
    st.session_state.chat_messages.append({"sender": "user", "text": user_question})
    # Simulate AI thinking
    with st.spinner("Thinking..."):
        time.sleep(1)
    # Add AI response
    ai_response = get_ai_response(user_question)
    st.session_state.chat_messages.append({"sender": "ai", "text": ai_response})
    st.experimental_rerun()

st.caption("AI can make mistakes. Verify important information.")
