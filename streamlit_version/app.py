
import streamlit as st
import os
import tempfile
import base64
import PyPDF2
from streamlit_chat import message
import time

st.set_page_config(
    page_title="ChatPDF",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state for storing application data
if "pdf_file" not in st.session_state:
    st.session_state.pdf_file = None
if "current_page" not in st.session_state:
    st.session_state.current_page = 1
if "total_pages" not in st.session_state:
    st.session_state.total_pages = 0
if "extracted_text" not in st.session_state:
    st.session_state.extracted_text = ""
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []
if "pdf_path" not in st.session_state:
    st.session_state.pdf_path = None
if "search_results" not in st.session_state:
    st.session_state.search_results = []

# Function to extract text from PDF
def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, "rb") as file:
        pdf_reader = PyPDF2.PdfReader(file)
        st.session_state.total_pages = len(pdf_reader.pages)
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() + "\n\n"
    
    return text

# Function to display PDF in an iframe
def display_pdf(file_path):
    with open(file_path, "rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode('utf-8')
    
    # Embed PDF viewer with page controls
    pdf_display = f"""
    <iframe
        src="data:application/pdf;base64,{base64_pdf}#page={st.session_state.current_page}"
        width="100%"
        height="600"
        style="border: none;">
    </iframe>
    """
    st.markdown(pdf_display, unsafe_allow_html=True)

# Function to search text in PDF content
def search_pdf_content(text, query):
    if not query.strip():
        return []
    
    results = []
    lines = text.split('\n')
    query_lower = query.lower()
    
    for i, line in enumerate(lines):
        if query_lower in line.lower():
            start_idx = max(0, i - 1)
            end_idx = min(len(lines) - 1, i + 1)
            context = '\n'.join(lines[start_idx:end_idx + 1])
            results.append({"match": line, "context": context})
    
    return results

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

# Create the sidebar for file uploads and navigation
with st.sidebar:
    st.title("ChatPDF")
    
    uploaded_file = st.file_uploader("Upload a PDF document", type="pdf")
    
    if uploaded_file is not None:
        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            st.session_state.pdf_path = tmp_file.name
        
        # Process the PDF
        with st.spinner("Processing PDF..."):
            st.session_state.pdf_file = {
                "name": uploaded_file.name,
                "path": st.session_state.pdf_path
            }
            st.session_state.extracted_text = extract_text_from_pdf(st.session_state.pdf_path)
            st.session_state.current_page = 1
            st.session_state.chat_messages = []
        
        st.success(f"PDF processed successfully: {uploaded_file.name}")
    
    if st.session_state.pdf_file:
        st.subheader("Current Document")
        st.text(st.session_state.pdf_file["name"])
        
        if st.button("New Chat"):
            st.session_state.chat_messages = []
            st.success("Started a new chat with the current PDF")

# Main content area with columns for PDF viewer and chat
if st.session_state.pdf_file:
    # Create two columns for PDF viewer and chat
    col1, col2 = st.columns([6, 4])
    
    with col1:
        # PDF controls
        st.subheader("PDF Viewer")
        
        # Navigation controls
        col_prev, col_page, col_next, col_zoom = st.columns([1, 2, 1, 2])
        
        with col_prev:
            if st.button("← Prev"):
                if st.session_state.current_page > 1:
                    st.session_state.current_page -= 1
        
        with col_page:
            new_page = st.number_input(
                "Page", 
                min_value=1, 
                max_value=st.session_state.total_pages,
                value=st.session_state.current_page
            )
            if new_page != st.session_state.current_page:
                st.session_state.current_page = new_page
        
        with col_next:
            if st.button("Next →"):
                if st.session_state.current_page < st.session_state.total_pages:
                    st.session_state.current_page += 1
        
        with col_zoom:
            zoom_options = ["Fit to width", "75%", "100%", "125%", "150%"]
            st.selectbox("Zoom", zoom_options, index=2)
        
        # Search functionality
        search_query = st.text_input("Search in document")
        if search_query:
            if st.button("Search"):
                with st.spinner("Searching..."):
                    st.session_state.search_results = search_pdf_content(
                        st.session_state.extracted_text, 
                        search_query
                    )
        
        # Display search results
        if st.session_state.search_results:
            st.subheader(f"Found {len(st.session_state.search_results)} results")
            for i, result in enumerate(st.session_state.search_results):
                with st.expander(f"Result {i+1}"):
                    st.text(result["context"])
        
        # Display PDF
        display_pdf(st.session_state.pdf_path)
    
    with col2:
        st.subheader("Chat")
        
        # Display chat messages
        chat_container = st.container()
        with chat_container:
            if not st.session_state.chat_messages:
                st.info("Upload a PDF and ask questions about it!")
                
                # Sample suggestions
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
        user_question = st.text_input("Ask about the document")
        if st.button("Send") and user_question:
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

else:
    # Display empty state when no PDF is loaded
    st.markdown(
        """
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 70vh;">
            <div style="background-color: rgba(79, 117, 255, 0.1); border-radius: 50%; padding: 20px; margin-bottom: 20px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4F75FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
            </div>
            <h2 style="margin-bottom: 8px; font-size: 24px;">No PDF loaded</h2>
            <p style="color: #6B7280; text-align: center;">Upload a PDF from the sidebar to get started.</p>
        </div>
        """,
        unsafe_allow_html=True
    )
