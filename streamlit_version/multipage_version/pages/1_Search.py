
import streamlit as st
import os

st.set_page_config(
    page_title="ChatPDF - Search",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Ensure session state values exist
if "pdf_file" not in st.session_state or st.session_state.pdf_file is None:
    st.warning("Please upload a PDF on the Home page first")
    st.stop()

if "extracted_text" not in st.session_state:
    st.warning("No text extracted from PDF. Return to home page.")
    st.stop()

# Sidebar for showing current document
with st.sidebar:
    st.title("ChatPDF - Search")
    st.subheader("Current Document")
    st.text(st.session_state.pdf_file["name"])

# Main content area
st.title("Search PDF Content")
st.info("The search functionality has been removed from this version.")
