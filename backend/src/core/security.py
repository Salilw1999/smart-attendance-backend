from datetime import datetime, timedelta, time, timezone
from jose import JWTError, jwt

# -------------------------------------------------------------------
# JWT CONFIGURATION
# -------------------------------------------------------------------
SECRET_KEY = "supersecretkey123"  # ⚠️ Replace with env variable in production
ALGORITHM = "HS256"

# -------------------------------------------------------------------
# ⏰ HELPER — Compute next midnight in IST (Asia/Kolkata)
# -------------------------------------------------------------------
def get_next_midnight_ist():
    """Return next midnight in IST, converted to UTC for JWT expiry."""
    IST_OFFSET = timedelta(hours=5, minutes=30)
    now_utc = datetime.now(timezone.utc)
    now_ist = now_utc + IST_OFFSET
    tomorrow_ist = now_ist.date() + timedelta(days=1)
    midnight_ist = datetime.combine(tomorrow_ist, time(0, 0, 0))
    # Convert back to UTC for JWT
    midnight_utc = midnight_ist - IST_OFFSET
    return midnight_utc

# -------------------------------------------------------------------
# 🔐 TOKEN CREATION
# -------------------------------------------------------------------
def create_access_token(data: dict):
    """
    Create a short-lived access token that expires at next midnight (IST).
    Example: if login is at 5 PM IST, token expires at 12:00 AM IST tonight.
    """
    expire = get_next_midnight_ist()
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict):
    """
    Create a refresh token valid for 7 days.
    Can be used to renew access tokens after daily expiration.
    """
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode = {**data, "exp": expire, "type": "refresh"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# -------------------------------------------------------------------
# 🔎 TOKEN DECODING
# -------------------------------------------------------------------
def decode_access_token(token: str):
    """Decode and validate access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


def decode_refresh_token(token: str):
    """Decode and validate refresh token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None
