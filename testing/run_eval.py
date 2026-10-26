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

# --- Expected NOC codes per occupation ---
EXPECTED_NOC = {
    "Nurse": "31301",
    "Software developer": "21232",
    "Tailor": "64200",
    "Primary school teacher": "41221",
    "Automechanic": "72410",
}

# --- Load and reshape test dataset ---
test_df = pd.read_csv("Test_dataset_for_evals_-_Sheet1.csv")

records = []
for _, row in test_df.iterrows():
    wordcount = row["Wordcount"]
    order = row["Order"]
    for occupation in EXPECTED_NOC.keys():
        text = row[occupation]
        if pd.notna(text) and str(text).strip():
            records.append({
                "wordcount": wordcount,
                "order": order,
                "occupation": occupation,
                "text": str(text),
                "expected_noc": EXPECTED_NOC[occupation],
            })

samples_df = pd.DataFrame(records)
print(f"Total test samples: {len(samples_df)}")

# --- Models ---
models = {
    "minilm": "paraphrase-multilingual-MiniLM-L12-v2",
    "bge_m3": "BAAI/bge-m3",
}

TOP_K = 5
CACHE_DIR = "embedding_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

all_results = []

for model_name, model_path in models.items():
    print(f"\n{'='*60}")
    print(f"MODEL: {model_name}")
    print(f"{'='*60}")

    cache_file = os.path.join(CACHE_DIR, f"{model_name}_noc_embeddings.npy")
    model = SentenceTransformer(model_path)

    if os.path.exists(cache_file):
        print("Loading cached NOC embeddings...")
        noc_embeddings = np.load(cache_file)
    else:
        print("Encoding NOC descriptions (one-time)...")
        noc_embeddings = model.encode(noc_texts, show_progress_bar=True, batch_size=32)
        np.save(cache_file, noc_embeddings)

    for _, sample in samples_df.iterrows():
        query_emb = model.encode([sample["text"]])
        sims = cosine_similarity(query_emb, noc_embeddings)[0]
        top_indices = np.argsort(sims)[::-1][:TOP_K]

        top_codes = [noc_codes[i] for i in top_indices]
        top_titles = [noc_titles[i] for i in top_indices]
        top_scores = [round(float(sims[i]), 4) for i in top_indices]

        expected = sample["expected_noc"]
        rank = top_codes.index(expected) + 1 if expected in top_codes else None

        all_results.append({
            "model": model_name,
            "occupation": sample["occupation"],
            "wordcount": sample["wordcount"],
            "order": sample["order"],
            "expected_noc": expected,
            "top1_noc": top_codes[0],
            "top1_title": top_titles[0],
            "top1_score": top_scores[0],
            "rank_of_expected": rank,
            "hit_top1": rank == 1,
            "hit_top3": rank is not None and rank <= 3,
            "hit_top5": rank is not None,
            "top5_codes": " | ".join(top_codes),
            "top5_titles": " | ".join(top_titles),
            "top5_scores": " | ".join(str(s) for s in top_scores),
        })

results_df = pd.DataFrame(all_results)
results_df.to_csv("eval_results.csv", index=False)
print(f"\nSaved {len(results_df)} results to eval_results.csv")

# --- Summary ---
print("\n" + "="*60)
print("SUMMARY (hit rate by model)")
print("="*60)
summary = results_df.groupby("model")[["hit_top1", "hit_top3", "hit_top5"]].mean().round(3)
print(summary)

print("\n" + "="*60)
print("SUMMARY (hit rate by model + occupation)")
print("="*60)
summary2 = results_df.groupby(["model", "occupation"])[["hit_top1", "hit_top3", "hit_top5"]].mean().round(3)
print(summary2)

print("\n" + "="*60)
print("SUMMARY (hit rate by model + word count)")
print("="*60)
summary3 = results_df.groupby(["model", "wordcount"])[["hit_top1", "hit_top3", "hit_top5"]].mean().round(3)
print(summary3)