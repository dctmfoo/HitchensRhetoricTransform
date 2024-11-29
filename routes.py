from flask import render_template, request, jsonify, send_from_directory
from flask_login import login_required, current_user
from functools import wraps
from app import app, db, verify_token
from models import Transformation, User
from utils.gemini_helper import transform_text
from auth import auth
import os

# Register the auth blueprint
app.register_blueprint(auth)

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

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path and os.path.exists(os.path.join(app.static_folder, 'react', path)):
        return send_from_directory(os.path.join(app.static_folder, 'react'), path)
    return send_from_directory(os.path.join(app.static_folder, 'react'), 'index.html')

@app.route('/promote-admin/<username>')
def promote_to_admin(username):
    user = User.query.filter_by(username=username).first()
    if user:
        user.is_admin = True
        db.session.commit()
        return jsonify({'message': f'User {username} promoted to admin'})
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/transform', methods=['POST'])
@token_required
@login_required
def transform():
    try:
        data = request.get_json()
        input_text = data.get('text', '')
        verbosity_level = int(data.get('verbosity', 1))
        persona = data.get('persona', 'hitchens').lower()
        
        if not input_text:
            return jsonify({'error': 'No text provided'}), 400
            
        transformed_text = transform_text(input_text, persona, verbosity_level)
        
        transformation = Transformation(
            input_text=input_text,
            output_text=transformed_text,
            verbosity_level=verbosity_level,
            persona=persona,
            user_id=current_user.id
        )
        db.session.add(transformation)
        db.session.commit()
        
        return jsonify({
            'transformed_text': transformed_text,
            'id': transformation.id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history')
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
