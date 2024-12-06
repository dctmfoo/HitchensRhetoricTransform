import os
import logging
from datetime import datetime, timedelta
from flask import Flask
from flask_login import LoginManager
import jwt
from database import db

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Initialize Flask application
app = Flask(__name__, 
    static_folder='static/react',
    template_folder='templates'
)

# Basic Configuration
app.config.update(
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", "hitchens_secret_key"),
    SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL"),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SQLALCHEMY_ENGINE_OPTIONS={
        "pool_recycle": 300,
        "pool_pre_ping": True
    },
    JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY", "hitchens_secret_key"),
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=1)
)

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

from utils.token_helper import generate_token, verify_token

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Initialize database and register blueprints
with app.app_context():
    try:
        # Import models and create tables
        import models
        from auth import auth
        from admin import admin
        from routes import routes
        
        # Create tables
        db.create_all()
        logger.info("Database tables created successfully")
        
        # Register blueprints
        app.register_blueprint(auth)
        app.register_blueprint(admin)
        app.register_blueprint(routes)
        
        logger.info("Blueprints registered successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize application: {str(e)}")
        logger.exception("Detailed traceback:")
        raise

if __name__ == '__main__':
    try:
        logger.info("Starting Flask application on port 5000...")
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True
        )
    except Exception as e:
        logger.error(f"Failed to start Flask application: {str(e)}")
        logger.exception("Detailed traceback:")
        raise
