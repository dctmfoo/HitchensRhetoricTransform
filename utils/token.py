import jwt
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

def generate_token(user_id, secret_key, expiry_days=1):
    try:
        payload = {
            'exp': datetime.utcnow() + timedelta(days=expiry_days),
            'iat': datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            secret_key,
            algorithm='HS256'
        )
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return None

def verify_token(token, secret_key):
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=['HS256']
        )
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
