#  Rooted

**Rooted is for refugees arriving in Canada who don't know where to start, or who feel too overwhelmed to reach out to social services.** It meets you where you are: whether you have formal credentials, informal work experience, or no documents at all.

Tell Rooted what you've done in your own words. It matches your skills (formal or informal) to the Canadian NOC (National Occupational Classification) database and returns your top career pathway matches. For each match, you get a plain-language pathway card with the steps to take, estimated time and costs, and funding sources available to you. You can export this card and bring it to a settlement agency or social services for further help.

**Privacy first.** Rooted does not store, log, or retain any personal information. Everything you share is processed in memory and discarded when your session ends. This app is for the people, built with care and designed to be a tool you can trust.

Built for the AI4Good Lab (Mila/McGill, 2026).

---

## What it does

1. **Describe your experience**: type your work history in any language
2. **Get matched**: BGE-M3 matches your description to the 516 Canadian NOC unit groups
3. **See your pathway**: gpt-oss-20b (via Groq) generates a step-by-step credential recognition card with estimated time, costs, and funding options

---

## Tech stack

| Layer | Technology | Hosted on |
|-------|-----------|-----------|
| Frontend | React + TypeScript + Vite | Vercel (free) |
| Backend | Python + Gradio API (`backend/gradio_app.py`) | Hugging Face ZeroGPU Space (free) |
| Matching | BGE-M3 (`BAAI/bge-m3`), multilingual, so descriptions are matched in their original language | Space CPU (GPU only to build the index at boot) |
| PDF translation | NLLB-200 (`facebook/nllb-200-distilled-600M`) | Space CPU |
| Pathway generation | gpt-oss-20b via Groq (any OpenAI-compatible API works) | Groq free tier |
| NOC data | ESDC level5.csv (516 unit groups) | Bundled |

The browser calls the Space directly with `@gradio/client`. Requests never use the GPU: on ZeroGPU each GPU call counts against the visitor's daily quota, and visitors without a Hugging Face account get only a couple of minutes a day. Both models run on the Space's CPU instead, and the GPU is used once at boot to build the occupation index.

**What goes where.** A person's own description is only ever processed by the Space. The LLM receives the matched occupation, the province and the document situation, never the person's words.

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com/keys). In Groq's Data Controls settings, turn on Zero Data Retention.

---

## Running locally

### 1. Backend

```bash
cd backend
pip install -r requirements.txt gradio==6.30.0
```

Create `backend/.env`:
```
LLM_API_KEY=your_groq_api_key_here
```

Start it:
```bash
python gradio_app.py
```

The first start downloads BGE-M3 and NLLB and builds the NOC index, which takes a few minutes on CPU. It then runs at `http://localhost:7860`, where *Use via API* lists the endpoints. (`main.py` is the older FastAPI version of the same backend and still works with `uvicorn main:app --port 8000`, but the frontend now talks to the Gradio app.)

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
VITE_USE_MOCK=false
VITE_SPACE=http://localhost:7860
```

Then `npm run dev` and open `http://localhost:3000`.

To work on the frontend without the backend, set `VITE_USE_MOCK=true` and it will use realistic mock matches and pathway cards.

---

## Deploying

### Backend: Hugging Face ZeroGPU Space

1. Create a Space at [huggingface.co/new-space](https://huggingface.co/new-space): SDK **Gradio**, hardware **ZeroGPU**, visibility **Public**. Free accounts can host up to 2 ZeroGPU Spaces once the account is 30 days old with a verified email.
2. In the Space's **Settings > Variables and secrets**, add the secret `LLM_API_KEY` (your Groq key).
3. Upload the backend folder, either:
   - **Automatically:** in this GitHub repo, add the Actions variable `HF_SPACE` (e.g. `jamieleeserhuan/rooted-api`) and the secret `HF_TOKEN` (a Hugging Face token with write access). Every push to `main` that touches `backend/` then deploys it (`.github/workflows/deploy-space.yml`).
   - **Manually:** `hf upload jamieleeserhuan/rooted-api backend . --repo-type space --exclude "data/cache/**"`

`backend/README.md` holds the Space's configuration (SDK version, Python version, entry file).

### Frontend: Vercel

Set the project's root directory to `frontend` and add the environment variable `VITE_SPACE` with your Space id (e.g. `jamieleeserhuan/rooted-api`), then redeploy.

---

## Project structure

```
rooted/
├── backend/                  # Deployed as the Hugging Face Space
│   ├── gradio_app.py         # Space entry point: /match, /pathway, /export_pdf
│   ├── main.py               # Older FastAPI version of the same API
│   ├── pathway.py            # LLM pathway card generation (Groq)
│   ├── app/
│   │   ├── matcher.py        # BGE-M3 NOC matching
│   │   ├── translator.py     # Language detection + NLLB translation
│   │   ├── pdf_exporter.py   # PDF report
│   │   └── funding_retriever.py
│   ├── data/level5.csv       # NOC dataset (516 unit groups)
│   ├── README.md             # Space configuration
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── space.ts      # Connection to the Space
│       │   ├── match.ts
│       │   └── pathway.ts
│       ├── components/
│       ├── App.tsx
│       └── types.ts
└── .github/workflows/deploy-space.yml
```

---

## Environment variables

### Backend (`backend/.env` locally, Space secrets in production)
| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_API_KEY` | Yes | API key for the LLM provider (Groq by default) |
| `LLM_BASE_URL` | No | OpenAI-compatible base URL. Default: `https://api.groq.com/openai/v1` |
| `LLM_MODEL` | No | Model name. Default: `openai/gpt-oss-20b` |

### Frontend (`frontend/.env.local` locally, Vercel environment variables in production)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_SPACE` | none | Space id (`owner/name`) or local URL of the backend |
| `VITE_USE_MOCK` | `false` | Set to `true` to run without the backend |

---

## Disclaimer

Pathway cards are AI-generated and may not reflect the latest regulatory requirements. Always verify with the relevant regulatory body or a certified immigration professional.
