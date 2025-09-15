# app/face_utils.py
from io import BytesIO
import face_recognition
from typing import Optional


def get_face_encoding(image_bytes: bytes) -> Optional[list]:
    """
    Extract face encoding from an image. Returns None if no face detected.
    """
    # Wrap bytes into a file-like object for PIL
    image_file = BytesIO(image_bytes)

    # Load image from bytes
    image = face_recognition.load_image_file(image_file)

    # Get face encodings
    encodings = face_recognition.face_encodings(image)

    if len(encodings) > 0:
        return encodings[0].tolist()  # store as list in DB/JSON
    return None
