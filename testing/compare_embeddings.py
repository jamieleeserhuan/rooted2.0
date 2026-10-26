import json
import os
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# --- Load NOC data ---
noc_df = pd.read_csv("../backend/data/level5.csv")

NOC_CODE_COL = "NOC_Code"
TITLE_COL = "Class_Title"
DEF_COL = "Class_Definition"

noc_texts = (noc_df[TITLE_COL].astype(str) + ". " + noc_df[DEF_COL].astype(str)).tolist()
noc_codes = noc_df[NOC_CODE_COL].astype(str).tolist()
noc_titles = noc_df[TITLE_COL].astype(str).tolist()

# --- Load test cases ---
with open("test_cases.json") as f:
    test_cases = json.load(f)

# --- Models to compare ---
models = {
    "minilm": "paraphrase-multilingual-MiniLM-L12-v2",
    "bge_m3": "BAAI/bge-m3",
}

TOP_K = 5
CACHE_DIR = "embedding_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

for model_name, model_path in models.items():
    print(f"\n{'='*60}")
    print(f"MODEL: {model_name} ({model_path})")
    print(f"{'='*60}")

    cache_file = os.path.join(CACHE_DIR, f"{model_name}_noc_embeddings.npy")

    model = SentenceTransformer(model_path)

    if os.path.exists(cache_file):
        print("Loading cached NOC embeddings...")
        noc_embeddings = np.load(cache_file)
    else:
        print("Encoding NOC descriptions (one-time, will be cached)...")
        noc_embeddings = model.encode(noc_texts, show_progress_bar=True, batch_size=32)
        np.save(cache_file, noc_embeddings)

    for case in test_cases:
        query_emb = model.encode([case["text"]])
        sims = cosine_similarity(query_emb, noc_embeddings)[0]
        top_indices = np.argsort(sims)[::-1][:TOP_K]

        print(f"\n--- {case['id']} ---")
        print(f"Expected keywords: {case['expected_keywords']}")
        print("Top matches:")
        for idx in top_indices:
            print(f"  [{sims[idx]:.4f}] NOC {noc_codes[idx]}: {noc_titles[idx]}")