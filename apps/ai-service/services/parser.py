"""Resume file parsing service."""
import io
import re
from pathlib import Path


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF bytes. Falls back through pdfplumber → pdfminer → pytesseract."""
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            pages_text = [page.extract_text() or "" for page in pdf.pages]
            text = "\n".join(pages_text)
            if text.strip():
                return text
    except Exception:
        pass

    try:
        from pdfminer.high_level import extract_text as pdfminer_extract
        text = pdfminer_extract(io.BytesIO(content))
        if text and text.strip():
            return text
    except Exception:
        pass

    # OCR fallback for image-only PDFs
    try:
        import pytesseract
        from PIL import Image
        import fitz  # PyMuPDF — optional
        doc = fitz.open(stream=content, filetype="pdf")
        texts = []
        for page in doc:
            pix = page.get_pixmap(dpi=150)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            texts.append(pytesseract.image_to_string(img))
        return "\n".join(texts)
    except Exception:
        pass

    raise ValueError("Failed to extract text from PDF")


def extract_text_from_docx(content: bytes) -> str:
    """Extract text from DOCX bytes."""
    import docx
    doc = docx.Document(io.BytesIO(content))
    paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(paragraphs)


def extract_text(content: bytes, file_name: str) -> str:
    """Dispatch to correct extractor based on file extension."""
    suffix = Path(file_name).suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(content)
    elif suffix in (".docx", ".doc"):
        return extract_text_from_docx(content)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")


def count_words(text: str) -> int:
    return len(text.split())


# Basic section detection heuristics
SECTION_HEADERS = {
    "experience": re.compile(r"\b(experience|work history|employment|professional)\b", re.I),
    "education": re.compile(r"\b(education|academic|qualification|degree)\b", re.I),
    "skills": re.compile(r"\b(skills|technologies|tech stack|expertise|proficiency)\b", re.I),
    "projects": re.compile(r"\b(projects|portfolio|personal projects|academic projects)\b", re.I),
    "certifications": re.compile(r"\b(certifications?|credentials?|courses?)\b", re.I),
}


def detect_page_count(content: bytes, file_name: str) -> int:
    """Estimate page count."""
    suffix = Path(file_name).suffix.lower()
    if suffix == ".pdf":
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                return len(pdf.pages)
        except Exception:
            return 1
    return 1  # DOCX: approximate
