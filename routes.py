import os
import logging
from flask import Blueprint, request, jsonify, send_from_directory
from flask_login import login_required, current_user
from functools import wraps
from extensions import db
# Import models after db is initialized
from models import User, Transformation
from utils.openai_helper import transform_text as openai_transform
from utils.gemini_helper import transform_text as gemini_transform

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create blueprint
main = Blueprint('main', __name__, static_folder='static/react', static_url_path='/')

# Configure logging
logger = logging.getLogger(__name__)

# Configure transform functions with error handling
TRANSFORM_FUNCTIONS = {}

def initialize_transform_functions():
    """Initialize and validate transform functions"""
    global TRANSFORM_FUNCTIONS, DEFAULT_API
    
    transforms = {
        'openai': openai_transform,
        'gemini': gemini_transform
    }
    
    # Validate each transform function
    for name, func in transforms.items():
        try:
            if func is not None:
                # Validate API keys are present
                if name == 'openai' and not os.environ.get('OPENAI_API_KEY'):
                    logger.warning(f"Skipping {name}: OPENAI_API_KEY not configured")
                    continue
                if name == 'gemini' and not os.environ.get('GEMINI_API_KEY'):
                    logger.warning(f"Skipping {name}: GEMINI_API_KEY not configured")
                    continue
                TRANSFORM_FUNCTIONS[name] = func
                logger.info(f"Successfully registered {name} transform function")
        except Exception as e:
            logger.error(f"Failed to initialize {name} transform: {str(e)}")
    
    if not TRANSFORM_FUNCTIONS:
        logger.error("No transform functions available")
        return False
    
    return True

# Initialize transform functions
if not initialize_transform_functions():
    logger.error("Failed to initialize any transform functions")

# Set default API provider
DEFAULT_API = 'openai' if 'openai' in TRANSFORM_FUNCTIONS else \
             next(iter(TRANSFORM_FUNCTIONS.keys())) if TRANSFORM_FUNCTIONS else None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        from flask import current_app
        user_id = current_app.verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        return f(*args, **kwargs)
    return decorated

@main.route('/', defaults={'path': 'index.html'})
@main.route('/<path:path>')
def serve_react(path):
    try:
        if path != "index.html" and os.path.exists(os.path.join(main.static_folder, path)):
            return send_from_directory(main.static_folder, path)
        return send_from_directory(main.static_folder, 'index.html')
    except Exception as e:
        logger.error(f"Error serving static file: {str(e)}")
        return f"Error serving file: {str(e)}", 500

@main.route('/api/transform', methods=['POST'])
@login_required
def transform():
    """Handle text transformation requests"""
    try:
        # Validate request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No request data provided'}), 400
        
        # Extract and validate parameters
        input_text = data.get('text', '').strip()
        if not input_text:
            return jsonify({'error': 'No text provided'}), 400
            
        try:
            verbosity_level = int(data.get('verbosity', 1))
            if verbosity_level not in [1, 2, 3]:
                return jsonify({'error': 'Invalid verbosity level'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid verbosity level format'}), 400
            
        persona = data.get('persona', 'hitchens').lower()
        api_provider = data.get('api_provider', DEFAULT_API).lower()
        
        # Validate API provider
        if not TRANSFORM_FUNCTIONS:
            logger.error("No transform functions available")
            return jsonify({'error': 'Text transformation service is currently unavailable'}), 503
            
        if api_provider not in TRANSFORM_FUNCTIONS:
            available_providers = list(TRANSFORM_FUNCTIONS.keys())
            return jsonify({
                'error': f'Invalid API provider: {api_provider}',
                'available_providers': available_providers
            }), 400
            
        # Perform transformation
        try:
            transform_func = TRANSFORM_FUNCTIONS[api_provider]
            transformed_text = transform_func(input_text, persona, verbosity_level)
            
            if not transformed_text:
                raise ValueError("Transformation returned empty result")
                
            # Save transformation record
            transformation = Transformation(
                input_text=input_text,
                output_text=transformed_text,
                verbosity_level=verbosity_level,
                persona=persona,
                api_provider=api_provider,
                user_id=current_user.id
            )
            db.session.add(transformation)
            db.session.commit()
            
            return jsonify({
                'transformed_text': transformed_text,
                'id': transformation.id,
                'api_provider': api_provider,
                'status': 'success'
            })
            
        except Exception as transform_error:
            logger.error(f"Transformation error with {api_provider}: {str(transform_error)}")
            db.session.rollback()
            return jsonify({
                'error': f'Transformation failed: {str(transform_error)}',
                'api_provider': api_provider
            }), 500
            
    except Exception as e:
        logger.error(f"Unexpected error in transform route: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@main.route('/api/config/providers', methods=['GET'])
@login_required
def get_api_providers():
    """Get available API providers and default provider"""
    try:
        # Ensure we have at least one provider available
        available_providers = list(TRANSFORM_FUNCTIONS.keys())
        if not available_providers:
            return jsonify({'error': 'No API providers configured'}), 500
            
        return jsonify({
            'providers': available_providers,
            'default': DEFAULT_API if DEFAULT_API in available_providers else available_providers[0]
        })
    except Exception as e:
        main.logger.error(f"Error fetching API providers: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main.route('/api/history')
@login_required
def history():
    try:
        transformations = Transformation.query.filter_by(
            user_id=current_user.id
        ).order_by(
            Transformation.created_at.desc()
        ).all()
        return jsonify([t.to_dict() for t in transformations])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
