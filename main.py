from flask import Flask
from flask_cors import CORS
from datetime import timedelta
import os
import logging
from extensions import db, login_manager, logger

def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger(__name__)

def create_app():
    # Initialize Flask app
    app = Flask(__name__, 
                static_url_path='',
                static_folder='static/react')

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

    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)

    with app.app_context():
        # Import models after db initialization
        from models import User

        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))

        from utils.token import verify_token
        app.verify_token = lambda token: verify_token(token, app.config['JWT_SECRET_KEY'])

        # Register blueprints
        from routes import main as main_blueprint
        from admin import admin as admin_blueprint
        from auth import auth as auth_blueprint

        app.register_blueprint(main_blueprint)
        app.register_blueprint(admin_blueprint)
        app.register_blueprint(auth_blueprint)

        # Create all tables
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}")
            raise

    return app

if __name__ == "__main__":
    logger = configure_logging()
    app = create_app()
    try:
        logger.info("Starting Flask application...")
        logger.info(f"Static folder: {app.static_folder}")
        logger.info(f"Static url path: {app.static_url_path}")
        app.run(host="0.0.0.0", port=5000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start Flask application: {e}")
        raise
