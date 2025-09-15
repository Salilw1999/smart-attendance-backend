import requests
import pickle

API_BASE = "http://<YOUR_SERVER_IP>:8000"

def fetch_faces():
    r = requests.get(f"{API_BASE}/students")
    students = r.json()

    known_faces = {}
    for s in students:
        if s["face_encoding"]:
            known_faces[s["id"]] = s["face_encoding"]

    with open("known_faces.pkl", "wb") as f:
        pickle.dump(known_faces, f)

    print(f"Saved {len(known_faces)} face encodings")

if __name__ == "__main__":
    fetch_faces()
