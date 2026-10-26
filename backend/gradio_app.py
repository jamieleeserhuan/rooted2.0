"""
gradio_app.py
-------------
The Rooted backend as a Hugging Face ZeroGPU Space.

It exposes the same three operations as main.py (the FastAPI server), as
Gradio API endpoints that the React frontend calls with @gradio/client:

  /match       translate-free multilingual matching of a description to NOC codes
  /pathway     LLM pathway card for one NOC occupation (runs on CPU, calls Groq)
  /export_pdf  PDF pathway report, translated back into the user's language

HOW ZEROGPU IS USED HERE:
  On ZeroGPU, every @spaces.GPU call counts against the *visitor's* daily GPU
  quota, and visitors without a Hugging Face account get only a couple of
  minutes a day. Rooted's users are refugees who will not have accounts, so
  no request ever uses the GPU: both models stay on CPU, where embedding one
  description takes about a second. The GPU is used once, at boot, to build
  the 516-occupation index, which runs on the Space's own allowance.

PRIVACY:
  Nothing the user types is written to disk or logged. Errors are logged without
  any user text. The PDF is returned as base64 text, so it never lands
  in Gradio's file cache.

RUN LOCALLY:
  cd backend
  python gradio_app.py        # @spaces.GPU does nothing off ZeroGPU; runs on CPU
"""

import os
from pathlib import Path

HERE = Path(__file__).resolve().parent

# On the Space, this folder is the repo root, so point the matcher at the data
# explicitly instead of relying on it finding a parent folder named "backend".
os.environ.setdefault("NOC_INPUT_PATH", str(HERE / "data" / "level5.csv"))
os.environ.setdefault("NOC_CACHE_DIR", str(HERE / "data" / "cache"))

# spaces must be imported before torch (and anything that imports torch).
import spaces  # noqa: E402

import base64  # noqa: E402
import logging  # noqa: E402
import re  # noqa: E402

import gradio as gr  # noqa: E402
import torch  # noqa: E402
from dotenv import load_dotenv  # noqa: E402

load_dotenv()

from app import matcher  # noqa: E402
from app.pdf_exporter import generate_pdf  # noqa: E402
from app.translator import (  # noqa: E402
    load_translation_model,
    load_translation_tokenizer,
    resolve_source_language,
)
from pathway import card_to_dict, generate_pathway_card  # noqa: E402

logger = logging.getLogger("rooted")
logger.setLevel(logging.INFO)
logger.propagate = False
if not logger.handlers:
    logger.addHandler(logging.StreamHandler())

MAX_DESCRIPTION_CHARS = 4000
DOCUMENT_OPTIONS = {"none", "some", "full"}
ENGLISH_CODES = {"", "auto", "english", "eng_latn"}


# =============================================================================
# MODELS (kept on CPU so requests never use a visitor's GPU quota)
# =============================================================================

torch.set_num_threads(max(1, os.cpu_count() or 1))

embedding_model = matcher.load_embedding_model().to("cpu")

# Translation is only used to translate PDFs, so if it fails to load, keep the
# app running and hand out English PDFs instead of crashing the whole Space.
try:
    load_translation_tokenizer()
    load_translation_model().to("cpu")
    TRANSLATION_READY = True
except Exception as e:
    TRANSLATION_READY = False
    logger.error("Translation unavailable, PDFs will be in English. %s", e)


# =============================================================================
# NOC INDEX
# The 516 occupation embeddings are built once when the Space boots and kept
# in memory. This is the only GPU use: it runs at startup on the Space's own
# allowance, not a visitor's (ZeroGPU also requires at least one GPU function).
# The model is moved to the GPU for the build and back to CPU afterwards.
# =============================================================================

@spaces.GPU(duration=180)
def _build_index_on_gpu():
    embedding_model.to("cuda")
    try:
        return matcher.build_index(embedding_model)
    finally:
        embedding_model.to("cpu")


_index = matcher.load_cached_index()
if _index is None:
    logger.info("Building NOC index (first boot)...")
    try:
        _index = _build_index_on_gpu()
    except Exception as e:
        logger.error("GPU index build failed, building on CPU (slower): %s", e)
        embedding_model.to("cpu")
        _index = matcher.build_index(embedding_model)
matcher.set_index(*_index)
logger.info("NOC index ready: %d occupations", len(_index[1]))


# =============================================================================
# HELPERS
# =============================================================================

def _detect_language(source_lang: str, text: str) -> str:
    # The translator signals unsupported or undetectable languages with
    # SystemExit, which must never escape a request handler.
    try:
        return resolve_source_language(source_lang or "auto", text)
    except (Exception, SystemExit):
        return "eng_Latn"


def _clean_short(value: str, fallback: str, max_len: int = 40) -> str:
    value = re.sub(r"[^A-Za-z _-]", "", value or "").strip()
    return value[:max_len] or fallback


# =============================================================================
# API ENDPOINTS
# =============================================================================

def match(description: str, source_lang: str = "auto") -> dict:
    """Match a work experience description (any language) to the top NOC occupations."""
    text = matcher.normalize_query_text(description or "")[:MAX_DESCRIPTION_CHARS]
    if not text:
        raise gr.Error("Please describe your work experience first.")

    detected_language = _detect_language(source_lang, text)
    try:
        query_embedding = matcher.embed_text(embedding_model, text)
    except Exception as e:
        logger.error("match failed: %s", type(e).__name__)
        raise gr.Error("Matching is temporarily unavailable. Please try again in a moment.")

    return {
        "matches": matcher.rank_matches(query_embedding),
        "detected_language": detected_language,
    }


def pathway(
    noc_code: str,
    title: str,
    definition: str = "",
    province: str = "ON",
    documents_available: str = "some",
) -> dict:
    """Generate a plain-language pathway card for one NOC occupation."""
    if documents_available not in DOCUMENT_OPTIONS:
        documents_available = "some"
    card = generate_pathway_card(
        noc_code=re.sub(r"\D", "", str(noc_code))[:5],
        title=(title or "")[:200],
        definition=(definition or "")[:2000],
        province=_clean_short(province, "ON"),
        documents_available=documents_available,
    )
    return card_to_dict(card)


def export_pdf(
    user_text: str,
    detected_language: str,
    province: str,
    jobs: list[dict],
    pathway_text: str = "",
) -> str:
    """Build the PDF pathway report and return it as base64 text."""
    args = dict(
        user_text=(user_text or "")[:MAX_DESCRIPTION_CHARS],
        detected_language=detected_language or "auto",
        province=province or "",
        jobs=jobs or [],
        pathway_text=(pathway_text or "")[:8000],
    )
    if not TRANSLATION_READY:
        args["detected_language"] = "eng_Latn"
    try:
        pdf_bytes = generate_pdf(**args)
    except Exception as e:
        # If translation fails for any reason, still give the person a PDF.
        logger.error("translated PDF failed, falling back to English: %s", type(e).__name__)
        args["detected_language"] = "eng_Latn"
        pdf_bytes = generate_pdf(**args)
    return base64.b64encode(pdf_bytes).decode("ascii")


# =============================================================================
# APP
# =============================================================================

with gr.Blocks(title="Rooted API") as demo:
    gr.Markdown(
        "# Rooted API\n"
        "This Space is the backend for **Rooted**, a privacy-first tool that helps "
        "refugees in Canada match their skills to Canadian occupations. "
        "Nothing you send is stored. See *Use via API* below for the endpoints."
    )
    gr.api(match, api_name="match")
    gr.api(pathway, api_name="pathway")
    gr.api(export_pdf, api_name="export_pdf")

demo.queue(default_concurrency_limit=4)

if __name__ == "__main__":
    demo.launch(show_error=True)
