import numpy as np
from db import get_recommendations, parse_embedding


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def mmr_rerank(results,query_title, top_n=10, lambda_param=0.7):
   
    candidates = []
    for r in results:
        title, genres, synopsis, score, embedding_str, distance = r
        if is_franchise(query_title, title):
            continue
        embedding = parse_embedding(embedding_str)
        relevance = 1 - distance
        candidates.append({
            "title": title,
            "genres": genres,
            "synopsis": synopsis,
            "score": score,
            "embedding": embedding,
            "relevance": relevance
        })

    selected = []
    remaining = candidates.copy()

    
    best = max(remaining, key=lambda c: c["relevance"])
    selected.append(best)
    remaining.remove(best)

    while len(selected) < top_n and remaining:
        best_candidate = None
        best_score = None
        for c in remaining:
            similarities = []
            for s in selected:
                sim = cosine_similarity(c["embedding"], s["embedding"])
                similarities.append(sim)
            max_sim = max(similarities)

            mmr_score = lambda_param * c["relevance"] - (1 - lambda_param) * max_sim
            if best_score is None or mmr_score > best_score:
                best_score = mmr_score
                best_candidate = c
        selected.append(best_candidate)
        remaining.remove(best_candidate)

    return selected
def is_franchise(query_title, candidate_title):
    q = query_title.lower().strip()
    c = candidate_title.lower().strip()
    
    
    if q == c:
        return True
    
    if c.startswith(q) and (len(c) == len(q) or not c[len(q)].isalnum()):
        return True 
    

def main():
    results = get_recommendations('Death Note', 30)
    reranked = mmr_rerank(results, query_title='Death Note', top_n=10, lambda_param=0.7)
    for c in reranked:
        print(f"{c['title']} ({c['score']}) - relevance: {c['relevance']:.3f}")


if __name__ == "__main__":
    main()