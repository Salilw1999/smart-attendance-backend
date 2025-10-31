# backend/src/services/face_matcher.py
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from models.student_model import Student

SIMILARITY_THRESHOLD = 0.6  # lower is more strict for cosine distance; we use similarity, so threshold ~0.6-0.65

def load_embeddings(db: Session):
    """Return two lists: ids and embeddings (numpy array) for students that have embeddings."""
    students = db.query(Student).filter(Student.face_embedding != None).all()
    ids = []
    embeddings = []
    for s in students:
        try:
            emb = np.array(s.face_embedding, dtype=np.float32)
            if emb.shape[0] == 128:
                ids.append(s.id)
                embeddings.append(emb)
        except Exception:
            continue
    if embeddings:
        return ids, np.vstack(embeddings)
    return [], np.empty((0,128), dtype=np.float32)

def match_embedding(known_embeddings, known_ids, query_embedding, top_k=1):
    """
    Return list of (student_id, similarity) for top_k matches
    """
    if known_embeddings.size == 0:
        return []
    sims = cosine_similarity([query_embedding], known_embeddings)[0]  # shape (n,)
    # get sorted top_k indices
    idxs = np.argsort(-sims)[:top_k]
    results = [(known_ids[i], float(sims[i])) for i in idxs]
    return results
