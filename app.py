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

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app)
    
    # Configuration
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "hitchens_secret_key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    app.config['JWT_SECRET_KEY'] = os.environ.get("JWT_SECRET_KEY", app.secret_key)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
    
    try:
        # Initialize extensions
        db.init_app(app)
        login_manager.init_app(app)
        login_manager.login_view = 'auth.login'
        
        logger.info("Successfully initialized Flask application")
        return app
    except Exception as e:
        logger.error(f"Failed to initialize Flask application: {str(e)}")
        raise

app = create_app()

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

if __name__ == '__main__':
    try:
        # Import routes after app initialization
        with app.app_context():
            from routes import *
            from admin import admin
            import models
            
            app.register_blueprint(admin)
            db.create_all()
            
            logger.info("Starting Flask server...")
            app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start Flask server: {str(e)}")
        raise
