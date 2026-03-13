import logging
import re

logger = logging.getLogger(__name__)


def parse_document(file_path: str, file_type: str) -> str:
    parsers = {
        "pdf": parse_pdf,
        "docx": parse_docx,
        "txt": parse_txt,
    }
    parser = parsers.get(file_type)
    if not parser:
        raise ValueError(f"Unsupported file type: {file_type}")
    return parser(file_path)


def parse_pdf(file_path: str) -> str:
    import pdfplumber

    text_parts: list[str] = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def parse_docx(file_path: str) -> str:
    from docx import Document

    doc = Document(file_path)
    return "\n\n".join(para.text for para in doc.paragraphs if para.text.strip())


def parse_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def extract_nos_units(text: str) -> list[dict]:
    """Extract NOS units and performance criteria from document text.

    Uses pattern matching to identify unit codes, titles, and criteria.
    Returns structured data for database storage.
    """
    units: list[dict] = []

    unit_pattern = re.compile(
        r"(?:NOS\s+)?(?:Unit\s+)?([A-Z]{2,10}[\s/]?\d{2,6}(?:\.\d+)?)\s*[:\-–]\s*(.+?)(?:\n|$)",
        re.IGNORECASE,
    )
    criterion_pattern = re.compile(
        r"(?:PC|P\.?C\.?|Performance\s+Criteria?)\s*(\d+(?:\.\d+)?)\s*[:\-–.\s]\s*(.+?)(?:\n|$)",
        re.IGNORECASE,
    )

    unit_matches = list(unit_pattern.finditer(text))

    if not unit_matches:
        logger.info("No NOS units found via pattern matching, creating default unit")
        units.append({
            "unit_code": "UNIT-001",
            "unit_title": "General Content",
            "description": "Extracted from document content",
            "criteria": _extract_criteria_from_text(text),
        })
        return units

    for i, match in enumerate(unit_matches):
        unit_code = match.group(1).strip()
        unit_title = match.group(2).strip()

        start = match.end()
        end = unit_matches[i + 1].start() if i + 1 < len(unit_matches) else len(text)
        section_text = text[start:end]

        criteria: list[dict] = []
        for crit_match in criterion_pattern.finditer(section_text):
            criteria.append({
                "criterion_code": f"PC{crit_match.group(1)}",
                "criterion_text": crit_match.group(2).strip(),
                "page_reference": None,
            })

        if not criteria:
            criteria = _extract_criteria_from_text(section_text)

        units.append({
            "unit_code": unit_code,
            "unit_title": unit_title,
            "description": None,
            "criteria": criteria,
        })

    return units


def _extract_criteria_from_text(text: str) -> list[dict]:
    """Fallback: extract numbered items as criteria."""
    criteria: list[dict] = []
    numbered = re.findall(r"^\s*(\d+)[.)]\s+(.+)$", text, re.MULTILINE)
    for num, content in numbered[:20]:
        criteria.append({
            "criterion_code": f"PC{num}",
            "criterion_text": content.strip(),
            "page_reference": None,
        })
    return criteria
