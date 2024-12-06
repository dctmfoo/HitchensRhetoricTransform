from flask import render_template, request, jsonify, send_from_directory, current_app
from flask_login import login_required, current_user
from functools import wraps
import os
from database import db
from models import Transformation, User
from utils.gemini_helper import transform_text
from utils.token_helper import verify_token

routes = Blueprint('routes', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        return f(*args, **kwargs)
    return decorated

@routes.route('/', defaults={'path': ''})
@routes.route('/<path:path>')
def serve_react(path):
    if path and os.path.exists(os.path.join(current_app.static_folder, 'react', path)):
        return send_from_directory(os.path.join(current_app.static_folder, 'react'), path)
    return send_from_directory(os.path.join(current_app.static_folder, 'react'), 'index.html')

@routes.route('/promote-admin/<username>')
def promote_to_admin(username):
    user = User.query.filter_by(username=username).first()
    if user:
        user.is_admin = True
        db.session.commit()
        return jsonify({'message': f'User {username} promoted to admin'})
    return jsonify({'error': 'User not found'}), 404

@routes.route('/api/transform', methods=['POST'])
@login_required
def transform():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400
            
        input_text = data.get('text', '').strip()
        if not input_text:
            return jsonify({'error': 'No text provided'}), 400
            
        try:
            verbosity_level = int(data.get('verbosity', 1))
            if verbosity_level not in [1, 2, 3]:
                return jsonify({'error': 'Invalid verbosity level. Must be 1, 2, or 3'}), 400
        except ValueError:
            return jsonify({'error': 'Verbosity level must be a number'}), 400
            
        persona = data.get('persona', 'hitchens').lower()
        if persona not in ['hitchens', 'trump', 'friedman', 'personal']:
            return jsonify({'error': 'Invalid persona selected'}), 400
            
        try:
            result = transform_text(input_text, persona, verbosity_level)
            if not result or 'text' not in result:
                return jsonify({'error': 'Failed to generate transformed text'}), 500
                
            transformation = Transformation(
                input_text=input_text,
                output_text=result['text'],
                verbosity_level=verbosity_level,
                persona=persona,
                user_id=current_user.id
            )
            db.session.add(transformation)
            db.session.commit()
            
            return jsonify({
                'transformed_text': result['text'],
                'id': transformation.id,
                'grounding': result.get('grounding', {}),  # Include grounding information in response
                'search_suggestions_ui': result.get('grounding', {}).get('search_suggestions_ui', '')
            })
            
        except ValueError as ve:
            return jsonify({'error': str(ve)}), 400
        except Exception as e:
            print(f"Transformation error: {str(e)}")
            return jsonify({'error': 'An error occurred during text transformation'}), 500
            
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@routes.route('/api/history')
@token_required
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
