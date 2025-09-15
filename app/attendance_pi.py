import cv2
import face_recognition
import requests
import pickle
import datetime
import numpy as np

API_BASE = "http://<YOUR_SERVER_IP>:8001"
ATTENDANCE_ENDPOINT = f"{API_BASE}/attendance"

with open("known_faces.pkl", "rb") as f:
    known_faces = pickle.load(f)  # {student_id: encoding list}

def capture_classroom(filename="classroom.jpg"):
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    if ret:
        cv2.imwrite(filename, frame)
        return frame
    else:
        raise RuntimeError("Camera capture failed")

def mark_attendance(student_id, filename):
    with open(filename, "rb") as f:
        files = {"evidence": ("classroom.jpg", f, "image/jpeg")}
        data = {
            "student_id": str(student_id),
            "status": "present",
            "source": "raspberry-pi",
            "note": f"Auto attendance {datetime.datetime.now()}"
        }
        r = requests.post(ATTENDANCE_ENDPOINT, data=data, files=files)
    print("API Response:", r.json())

def process_attendance():
    filename = "classroom.jpg"
    frame = capture_classroom(filename)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    print(f"Detected {len(face_encodings)} faces")

    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(
            [np.array(enc) for enc in known_faces.values()],
            face_encoding,
            tolerance=0.5
        )
        if True in matches:
            matched_id = list(known_faces.keys())[matches.index(True)]
            print(f"Matched Student ID: {matched_id}")
            mark_attendance(matched_id, filename)
        else:
            print("Unknown face detected")

if __name__ == "__main__":
    process_attendance()
