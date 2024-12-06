import os
import logging
from datetime import datetime, timedelta
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager
import jwt

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
login_manager = LoginManager()

try:
    # Configuration
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "hitchens_secret_key")
    database_url = os.environ.get("DATABASE_URL")
    
    if not database_url:
        logger.error("DATABASE_URL environment variable is not set")
        raise ValueError("DATABASE_URL environment variable is not set")
        
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get("JWT_SECRET_KEY", app.secret_key)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

    # Initialize extensions
    logger.info("Initializing database...")
    db.init_app(app)
    
    logger.info("Initializing login manager...")
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    logger.info("Application configuration completed successfully")
    
except Exception as e:
    logger.error(f"Failed to initialize application: {str(e)}")
    raise

def generate_token(user_id):
    """Generate JWT token for the user"""
    token = jwt.encode(
        {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=1)
        },
        app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )
    return token

def verify_token(token):
    """Verify JWT token and return user_id"""
    try:
        data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return data['user_id']
    except:
        return None

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Import routes after app initialization to avoid circular imports
try:
    with app.app_context():
        logger.info("Creating database tables...")
        from routes import *
        from admin import admin
        import models
        
        logger.info("Registering blueprints...")
        app.register_blueprint(admin)
        
        logger.info("Initializing database tables...")
        db.create_all()
        logger.info("Database tables created successfully")
        
except Exception as e:
    logger.error(f"Failed during route initialization and database setup: {str(e)}")
    raise

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
