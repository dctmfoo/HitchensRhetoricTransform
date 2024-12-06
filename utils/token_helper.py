import jwt
from datetime import datetime, timedelta
from flask import current_app

def generate_token(user_id):
    """Generate JWT token for the user"""
    return jwt.encode(
        {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=1)
        },
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )

def verify_token(token):
    """Verify JWT token and return user_id"""
    try:
        data = jwt.decode(
            token, 
            current_app.config['JWT_SECRET_KEY'], 
            algorithms=['HS256']
        )
        return data['user_id']
    except:
        return None
