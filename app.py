import os
import logging
from datetime import datetime, timedelta
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager
from flask_cors import CORS
import jwt

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, 
    static_folder='static/react',
    static_url_path=''
)

# Enable CORS
CORS(app)

# Configuration
app.config.update(
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", "hitchens_secret_key"),
    SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL"),
    SQLALCHEMY_ENGINE_OPTIONS={
        "pool_recycle": 300,
        "pool_pre_ping": True,
    },
    JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY", "hitchens_secret_key"),
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=1)
)

# Initialize database
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

def generate_token(user_id):
    """Generate JWT token for the user"""
    try:
        token = jwt.encode(
            {'user_id': user_id, 'exp': datetime.utcnow() + timedelta(days=1)},
            app.config['JWT_SECRET_KEY'],
            algorithm='HS256'
        )
        return token
    except Exception as e:
        logger.error(f"Failed to generate token: {str(e)}")
        return None

def verify_token(token):
    """Verify JWT token and return user_id"""
    try:
        data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return data['user_id']
    except Exception as e:
        logger.error(f"Failed to verify token: {str(e)}")
        return None

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Import models first to ensure they're registered
import models

# Import routes and register blueprints
from routes import *
from admin import admin
app.register_blueprint(admin)

# Create all tables
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise

if __name__ == '__main__':
    try:
        logger.info("Starting Flask server...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start Flask server: {str(e)}")
        raise
