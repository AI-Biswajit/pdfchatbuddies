
import streamlit as st
import os
import tempfile
import base64
import PyPDF2

st.set_page_config(
    page_title="ChatPDF - Home",
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
if "pdf_path" not in st.session_state:
    st.session_state.pdf_path = None

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

# Create the sidebar for file uploads
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
        
        st.success(f"PDF processed successfully: {uploaded_file.name}")
    
    if st.session_state.pdf_file:
        st.subheader("Current Document")
        st.text(st.session_state.pdf_file["name"])

st.title("PDF Viewer")

if st.session_state.pdf_file:
    # PDF controls
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
    
    # Display PDF
    display_pdf(st.session_state.pdf_path)
    
    st.markdown("""
    <div style="text-align: center; margin-top: 20px;">
        <p>Navigate to <b>Chat</b> or <b>Search</b> pages to interact with your PDF</p>
    </div>
    """, unsafe_allow_html=True)
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
