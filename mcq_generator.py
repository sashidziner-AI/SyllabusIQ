#!/usr/bin/env python3
"""Generate MCQs from NOS/PC-oriented PDF documents.

Usage:
  python mcq_generator.py input.pdf --format markdown
  python mcq_generator.py input.pdf --format csv --output mcqs.csv
"""

from __future__ import annotations

import argparse
import csv
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


@dataclass
class LineRef:
    text: str
    page: int


@dataclass
class PerformanceCriteria:
    name: str
    page: int
    lines: list[LineRef] = field(default_factory=list)


@dataclass
class NosModule:
    code: str
    name: str
    pcs: list[PerformanceCriteria] = field(default_factory=list)


def extract_pdf_pages(pdf_path: Path) -> list[str]:
    try:
        from pypdf import PdfReader
    except Exception as exc:  # pragma: no cover - dependency error path
        raise RuntimeError("Missing dependency: install pypdf (pip install pypdf)") from exc

    reader = PdfReader(str(pdf_path))
    pages: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text)
    if not pages:
        raise RuntimeError("No pages extracted from PDF")
    return pages


def normalize_line(line: str) -> str:
    return re.sub(r"\s+", " ", line.strip())


def split_lines_with_refs(pages: list[str]) -> list[LineRef]:
    refs: list[LineRef] = []
    for i, page_text in enumerate(pages, start=1):
        for raw in page_text.splitlines():
            text = normalize_line(raw)
            if text:
                refs.append(LineRef(text=text, page=i))
    return refs


NOS_CODE_RE = re.compile(r"\b([A-Z]{2,}-[A-Z0-9-]+|[A-Z]{2,}\/?[A-Z0-9-]+\.[0-9]+)\b")
PC_RE = re.compile(r"^(?:PC\s*\d+[\.:\-]?|Performance\s*Criteria\s*\d*[\.:\-]?)\s*(.+)$", re.I)


def parse_structure(lines: list[LineRef]) -> tuple[list[NosModule], list[PerformanceCriteria]]:
    nos_modules: list[NosModule] = []
    pcs_only: list[PerformanceCriteria] = []
    current_nos: NosModule | None = None
    current_pc: PerformanceCriteria | None = None

    for ref in lines:
        text = ref.text

        if "NOS" in text.upper() and NOS_CODE_RE.search(text):
            code = NOS_CODE_RE.search(text).group(1)
            name = text
            current_nos = NosModule(code=code, name=name)
            nos_modules.append(current_nos)
            current_pc = None
            continue

        m = PC_RE.match(text)
        if m:
            pc_name = m.group(1).strip(" -:") or text
            current_pc = PerformanceCriteria(name=pc_name, page=ref.page)
            if current_nos is not None:
                current_nos.pcs.append(current_pc)
            else:
                pcs_only.append(current_pc)
            continue

        if current_pc is not None:
            current_pc.lines.append(ref)

    # If NOS existed but no PCs captured inside, fallback to pcs_only.
    return nos_modules, pcs_only


def extract_concepts(pc: PerformanceCriteria) -> list[tuple[str, int]]:
    concepts: list[tuple[str, int]] = []

    for ref in pc.lines:
        text = ref.text
        if len(text.split()) < 4:
            continue
        if text.endswith(":"):
            continue
        # prioritize bullet-like or imperative lines
        if re.match(r"^(?:[-•]|\d+[\).])\s*", text) or re.search(
            r"\b(ensure|check|verify|follow|wear|report|inspect|record|maintain|identify)\b",
            text,
            flags=re.I,
        ):
            cleaned = re.sub(r"^(?:[-•]|\d+[\).])\s*", "", text).strip()
            if cleaned and cleaned.lower() not in {c[0].lower() for c in concepts}:
                concepts.append((cleaned, ref.page))

    if not concepts:
        # fallback: chunk first relevant sentence-like lines
        for ref in pc.lines[:8]:
            if len(ref.text.split()) >= 5:
                candidate = ref.text.strip()
                if candidate.lower() not in {c[0].lower() for c in concepts}:
                    concepts.append((candidate, ref.page))

    return concepts[:5]


def build_question(concept: str) -> tuple[str, list[str], str, str]:
    q = f"Which statement best reflects the correct approach to: {concept}?"
    correct = "Apply the requirement exactly as specified in the procedure and context."
    distractors = [
        "Skip the step when time is limited, then document it later.",
        "Perform it only when specifically instructed by a supervisor.",
        "Use personal preference instead of the defined process.",
    ]
    options = [correct] + distractors

    # stable rotation by hash for answer distribution
    idx = abs(hash(concept)) % 4
    rotated = options[idx:] + options[:idx]
    answer_letter = "ABCD"[rotated.index(correct)]

    explanation = (
        "The correct option aligns with the documented requirement for this concept. "
        "The other options are incorrect because they relax, defer, or replace the prescribed process."
    )
    return q, rotated, answer_letter, explanation


def rows_from_nos(nos_modules: list[NosModule]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for nos in nos_modules:
        for pc in nos.pcs:
            concepts = extract_concepts(pc)
            for concept, page in concepts[:5]:
                q, opts, ans, exp = build_question(concept)
                rows.append(
                    {
                        "NOS Code": nos.code,
                        "NOS Name": nos.name,
                        "Performance Criteria (PC)": pc.name,
                        "Question": q,
                        "Option A": opts[0],
                        "Option B": opts[1],
                        "Option C": opts[2],
                        "Option D": opts[3],
                        "Correct Answer": ans,
                        "Explanation": exp,
                        "Page Reference(PDF)": f"Page {page}",
                    }
                )
    return rows


def rows_from_pcs(pcs: list[PerformanceCriteria]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for pc in pcs:
        concepts = extract_concepts(pc)
        for concept, page in concepts[:5]:
            q, opts, ans, exp = build_question(concept)
            rows.append(
                {
                    "Performance Criteria (PC)": pc.name,
                    "Question": q,
                    "Option A": opts[0],
                    "Option B": opts[1],
                    "Option C": opts[2],
                    "Option D": opts[3],
                    "Correct Answer": ans,
                    "Explanation": exp,
                    "Page Reference(PDF)": f"Page {page}",
                }
            )
    return rows


def dedupe_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    seen: set[str] = set()
    out: list[dict[str, str]] = []
    for row in rows:
        key = re.sub(r"\W+", "", row["Question"].lower())
        if key in seen:
            continue
        seen.add(key)
        out.append(row)
    return out


def enforce_pc_question_count(rows: list[dict[str, str]], has_nos: bool) -> list[dict[str, str]]:
    field = "Performance Criteria (PC)"
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        grouped.setdefault(row[field], []).append(row)

    filtered: list[dict[str, str]] = []
    for _, group in grouped.items():
        # enforce max 5; include only PCs with at least 3 candidates
        if len(group) < 3:
            continue
        filtered.extend(group[:5])
    return filtered


def to_markdown(rows: list[dict[str, str]], columns: list[str]) -> str:
    header = "| " + " | ".join(columns) + " |"
    sep = "| " + " | ".join(["---"] * len(columns)) + " |"
    lines = [header, sep]
    for row in rows:
        vals = [row.get(c, "").replace("|", "\\|") for c in columns]
        lines.append("| " + " | ".join(vals) + " |")
    return "\n".join(lines)


def write_csv(rows: list[dict[str, str]], columns: list[str], output: Path) -> None:
    with output.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


def run(pdf_path: Path, out_format: str, output: Path | None) -> str:
    pages = extract_pdf_pages(pdf_path)
    refs = split_lines_with_refs(pages)
    nos_modules, pcs_only = parse_structure(refs)

    has_nos = bool(nos_modules and any(n.pcs for n in nos_modules))
    rows = rows_from_nos(nos_modules) if has_nos else rows_from_pcs(pcs_only)
    rows = dedupe_rows(rows)
    rows = enforce_pc_question_count(rows, has_nos)

    if has_nos:
        cols = [
            "NOS Code",
            "NOS Name",
            "Performance Criteria (PC)",
            "Question",
            "Option A",
            "Option B",
            "Option C",
            "Option D",
            "Correct Answer",
            "Explanation",
            "Page Reference(PDF)",
        ]
    else:
        cols = [
            "Performance Criteria (PC)",
            "Question",
            "Option A",
            "Option B",
            "Option C",
            "Option D",
            "Correct Answer",
            "Explanation",
            "Page Reference(PDF)",
        ]

    if out_format == "csv":
        if output is None:
            output = Path("mcqs.csv")
        write_csv(rows, cols, output)
        return f"Wrote {len(rows)} rows to {output}"

    md = to_markdown(rows, cols)
    if output:
        output.write_text(md, encoding="utf-8")
        return f"Wrote {len(rows)} rows to {output}"
    return md


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate MCQs from PDF")
    parser.add_argument("pdf", type=Path, help="Path to source PDF")
    parser.add_argument("--format", choices=["markdown", "csv"], default="markdown")
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()

    result = run(args.pdf, args.format, args.output)
    print(result)


if __name__ == "__main__":
    main()
