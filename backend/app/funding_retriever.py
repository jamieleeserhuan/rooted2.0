"""
funding_retriever.py
--------------------
Small retrieval helper for curated Canadian career/training funding programs.

Main function:
  get_funding_programs(province=None, noc_code=None, matched_title=None) -> list[dict]

HOW IT FITS INTO ROOTED:
  1. matcher.py returns the user's best NOC job matches
  2. pathway.py or main.py can pass the user's province and matched NOC/title here
  3. this file returns relevant funding programs from backend/data/funding_programs.json
  4. the pathway/RAG layer can cite each program's source_url

IMPORTANT:
  This retriever never invents funding details or exact NOC mappings. It only
  filters and scores records already curated in funding_programs.json.

TO USE THIS FILE:
  from app.funding_retriever import get_funding_programs

  programs = get_funding_programs(
      province="ON",
      noc_code="31301",
      matched_title="Registered nurses"
  )
  print(programs[0]["program_name"])
  print(programs[0]["source_url"])

DEPENDENCIES:
  Python standard library only.

DATA NEEDED:
  backend/data/funding_programs.json
"""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any


APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
DEFAULT_FUNDING_PATH = DATA_DIR / "funding_programs.json"
REQUIRED_PROGRAM_FIELDS = {
    "program_name",
    "province",
    "funding_amount",
    "eligibility",
    "target_careers",
    "target_nocs",
    "application_url",
    "source_url",
    "notes",
    "last_verified",
}
VALID_PROVINCES = {
    "AB",
    "BC",
    "MB",
    "NB",
    "NL",
    "NS",
    "NT",
    "NU",
    "ON",
    "PE",
    "QC",
    "SK",
    "YT",
}
CAREER_STOPWORDS = {
    "assistant",
    "assistants",
    "manager",
    "managers",
    "occupation",
    "occupations",
    "other",
    "registered",
    "service",
    "services",
    "worker",
    "workers",
}
BROAD_RETRIEVAL_TERMS = {
    "career retraining",
    "high demand occupations",
    "in demand jobs",
    "short term skills training",
    "skills training",
    "workforce competitiveness",
    "workforce readiness",
}


def normalize_text(value: object) -> str:
    """Lowercase and simplify text so matching is predictable."""
    if value is None:
        return ""
    text = str(value).lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_province(province: str | None) -> str:
    """Normalize user province input to the two-letter codes in the dataset."""
    if not province:
        return ""

    aliases = {
        "alberta": "AB",
        "ab": "AB",
        "british columbia": "BC",
        "bc": "BC",
        "manitoba": "MB",
        "mb": "MB",
        "new brunswick": "NB",
        "nb": "NB",
        "newfoundland and labrador": "NL",
        "newfoundland": "NL",
        "labrador": "NL",
        "nl": "NL",
        "northwest territories": "NT",
        "nt": "NT",
        "nova scotia": "NS",
        "ns": "NS",
        "nunavut": "NU",
        "nu": "NU",
        "ontario": "ON",
        "on": "ON",
        "prince edward island": "PE",
        "pei": "PE",
        "pe": "PE",
        "quebec": "QC",
        "québec": "QC",
        "qc": "QC",
        "saskatchewan": "SK",
        "sk": "SK",
        "yukon": "YT",
        "yt": "YT",
    }
    return aliases.get(normalize_text(province), str(province).strip().upper())


def validate_program(program: dict[str, Any], index: int) -> None:
    """Validate one curated record before it can be used for retrieval."""
    missing = sorted(REQUIRED_PROGRAM_FIELDS - set(program))
    if missing:
        raise ValueError(f"Funding record {index} is missing fields: {', '.join(missing)}")

    province = program.get("province")
    if province not in VALID_PROVINCES:
        raise ValueError(f"Funding record {index} has invalid province code: {province!r}")

    for field in ("eligibility", "target_careers", "target_nocs"):
        if not isinstance(program.get(field), list):
            raise ValueError(f"Funding record {index} field {field!r} must be a list.")

    for field in ("application_url", "source_url"):
        url = str(program.get(field, ""))
        if url and not url.startswith("https://"):
            raise ValueError(f"Funding record {index} field {field!r} must use https://")

    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(program.get("last_verified", ""))):
        raise ValueError(f"Funding record {index} must include last_verified as YYYY-MM-DD.")


@lru_cache(maxsize=1)
def load_funding_programs(path: str | Path = DEFAULT_FUNDING_PATH) -> list[dict[str, Any]]:
    """Load the curated funding dataset once and reuse it across calls."""
    funding_path = Path(path)
    with funding_path.open("r", encoding="utf-8") as file:
        records = json.load(file)
    if not isinstance(records, list):
        raise ValueError("funding_programs.json must contain a list of programs.")
    for index, program in enumerate(records):
        validate_program(program, index)
    return records


def program_retrieval_text(program: dict[str, Any]) -> str:
    """Combine searchable program fields without changing the source data."""
    parts = [
        program.get("program_name", ""),
        program.get("province", ""),
        program.get("funding_amount", ""),
        " ".join(program.get("eligibility", [])),
        " ".join(program.get("target_careers", [])),
        " ".join(program.get("target_nocs", [])),
        program.get("notes", ""),
    ]
    return normalize_text(" ".join(str(part) for part in parts))


def is_broad_program(program: dict[str, Any]) -> bool:
    """Return True when the source describes broad funding, not a narrow job stream."""
    career_terms = {normalize_text(term) for term in program.get("target_careers", [])}
    return bool(career_terms & BROAD_RETRIEVAL_TERMS)


def score_program(
    program: dict[str, Any],
    province: str,
    noc_code: str,
    matched_title: str,
) -> tuple[float, str]:
    """Score a program using only explicit dataset fields."""
    score = 0.0
    reasons: list[str] = []

    if province and program.get("province") == province:
        score += 0.45
        reasons.append("province match")

    target_nocs = {str(code) for code in program.get("target_nocs", [])}
    exact_noc_match = bool(noc_code and noc_code in target_nocs)
    if exact_noc_match:
        score += 0.50
        reasons.append("explicit NOC match")

    title_terms = set(normalize_text(matched_title).split())
    searchable_terms = set(program_retrieval_text(program).split())
    useful_terms = {
        term
        for term in title_terms
        if len(term) >= 4 and term not in CAREER_STOPWORDS and term in searchable_terms
    }
    if useful_terms:
        score += min(0.25, 0.08 * len(useful_terms))
        reasons.append("matched career terms: " + ", ".join(sorted(useful_terms)))

    # Targeted programs should not be returned for unrelated occupations just
    # because they are in the same province. Broad programs may be returned as
    # general supports, but the reason stays explicit.
    if province and (matched_title or noc_code) and not exact_noc_match and not useful_terms:
        if is_broad_program(program):
            reasons.append("broad funding program, not an explicit NOC match")
        else:
            return 0.0, "no explicit NOC or career match"

    if not reasons:
        reasons.append("general funding record")

    return round(min(score, 1.0), 2), "; ".join(reasons)


def get_funding_programs(
    province: str | None = None,
    noc_code: str | None = None,
    matched_title: str | None = None,
    limit: int = 3,
) -> list[dict[str, Any]]:
    """Return the best matching funding programs for province/NOC context.

    The function prefers province matches, then explicit NOC matches when the
    dataset has them, then broad title/career overlap. Targeted programs are
    not returned for unrelated occupations just because they share a province.
    """
    normalized_province = normalize_province(province)
    normalized_noc = str(noc_code or "").strip()
    title = str(matched_title or "").strip()

    scored_programs: list[dict[str, Any]] = []
    for program in load_funding_programs():
        # If the user selected a province, keep recommendations in that
        # province unless future data adds explicit cross-province NOC support.
        if normalized_province and program.get("province") != normalized_province:
            continue

        score, reason = score_program(
            program=program,
            province=normalized_province,
            noc_code=normalized_noc,
            matched_title=title,
        )
        if score <= 0:
            continue

        result = dict(program)
        result["confidence"] = score
        result["confidence_reason"] = reason
        scored_programs.append(result)

    scored_programs.sort(
        key=lambda item: (
            item["confidence"],
            item.get("province") == normalized_province,
            item.get("program_name", ""),
        ),
        reverse=True,
    )
    return scored_programs[:limit]


if __name__ == "__main__":
    demo = get_funding_programs(
        province="ON",
        matched_title="registered nurse",
    )
    print(json.dumps(demo, indent=2))
