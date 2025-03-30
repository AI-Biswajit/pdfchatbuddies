
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

if "search_results" not in st.session_state:
    st.session_state.search_results = []

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

# Sidebar for showing current document
with st.sidebar:
    st.title("ChatPDF - Search")
    st.subheader("Current Document")
    st.text(st.session_state.pdf_file["name"])

# Main search interface
st.title("Search PDF Content")

# Search input
search_col1, search_col2 = st.columns([3, 1])
with search_col1:
    search_query = st.text_input("Enter your search query")
    
with search_col2:
    if st.button("Search", type="primary"):
        if search_query:
            with st.spinner("Searching..."):
                st.session_state.search_results = search_pdf_content(
                    st.session_state.extracted_text, 
                    search_query
                )
                if not st.session_state.search_results:
                    st.info(f"No results found for '{search_query}'")
        else:
            st.warning("Please enter a search query")

# Display search results
if st.session_state.search_results:
    st.subheader(f"Found {len(st.session_state.search_results)} results")
    
    for i, result in enumerate(st.session_state.search_results):
        with st.expander(f"Result {i+1}"):
            st.text_area(
                "Context",
                result["context"],
                height=150,
                disabled=True
            )
            # Option to navigate to this part in the PDF would be here
            # in a more advanced implementation
