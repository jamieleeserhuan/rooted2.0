---
title: Rooted API
emoji: 🌱
colorFrom: green
colorTo: yellow
sdk: gradio
sdk_version: 6.30.0
python_version: "3.12"
app_file: gradio_app.py
pinned: false
short_description: Backend for Rooted, career pathways for refugees in Canada
---

# Rooted API

Backend for [Rooted](https://github.com/jamieleeserhuan/rooted2.0), a privacy-first tool that helps refugees arriving in Canada match their skills to Canadian occupations and get a plain-language career pathway.

This folder is deployed as a Hugging Face ZeroGPU Space. It exposes three API endpoints, called by the Rooted frontend with `@gradio/client`:

| Endpoint | What it does | Uses GPU |
|----------|--------------|----------|
| `/match` | Matches a description in any language to the top NOC occupations with BGE-M3 | No |
| `/pathway` | Generates a pathway card for one occupation with Llama 3.1 8B via Groq | No |
| `/export_pdf` | Builds the PDF report, translated with NLLB into the user's language | No |

No request uses the GPU, so visitors never run into ZeroGPU's daily quota. The GPU is only used once at boot to build the occupation index. Nothing sent to these endpoints is stored or logged.

## Space secrets

| Secret | Required | Description |
|--------|----------|-------------|
| `LLM_API_KEY` | Yes | Groq API key (or another OpenAI-compatible provider's key) |
| `LLM_BASE_URL` | No | Defaults to Groq |
| `LLM_MODEL` | No | Defaults to `llama-3.1-8b-instant` |
