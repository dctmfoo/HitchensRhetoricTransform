from flask import Blueprint, request, jsonify, send_from_directory
from flask_login import login_required, current_user
from functools import wraps
import os
from extensions import db
from models import Transformation, User
from utils.openai_helper import transform_text as openai_transform
from utils.gemini_helper import transform_text as gemini_transform

# Create blueprint
main = Blueprint('main', __name__)

# Configure transform functions with error handling
TRANSFORM_FUNCTIONS = {
    'openai': openai_transform,
    'gemini': gemini_transform
}

# Validate transform functions and set default
available_transforms = {k: v for k, v in TRANSFORM_FUNCTIONS.items() if v is not None}
if not available_transforms:
    main.logger.error("No transform functions available")
    TRANSFORM_FUNCTIONS = {}
else:
    TRANSFORM_FUNCTIONS = available_transforms

DEFAULT_API = 'openai'  # Default to OpenAI if available
if DEFAULT_API not in TRANSFORM_FUNCTIONS:
    DEFAULT_API = next(iter(TRANSFORM_FUNCTIONS.keys())) if TRANSFORM_FUNCTIONS else None

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

@main.route('/', defaults={'path': ''})
@main.route('/<path:path>')
def serve_react(path):
    if path and os.path.exists(os.path.join(main.static_folder, 'react', path)):
        return send_from_directory(os.path.join(main.static_folder, 'react'), path)
    return send_from_directory(os.path.join(main.static_folder, 'react'), 'index.html')

@main.route('/api/transform', methods=['POST'])
@login_required
def transform():
    try:
        data = request.get_json()
        input_text = data.get('text', '')
        verbosity_level = int(data.get('verbosity', 1))
        persona = data.get('persona', 'hitchens').lower()
        api_provider = data.get('api_provider', DEFAULT_API).lower()
        
        if not input_text:
            return jsonify({'error': 'No text provided'}), 400
            
        if api_provider not in TRANSFORM_FUNCTIONS:
            return jsonify({'error': f'Invalid API provider: {api_provider}'}), 400
            
        transform_func = TRANSFORM_FUNCTIONS[api_provider]
        transformed_text = transform_func(input_text, persona, verbosity_level)
        
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
            'api_provider': api_provider
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
