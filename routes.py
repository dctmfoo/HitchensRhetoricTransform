from flask import render_template, request, jsonify, send_from_directory
from app import app, db
from models import Transformation
from utils.openai_helper import transform_text
import os

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path and os.path.exists(os.path.join(app.static_folder, 'react', path)):
        return send_from_directory(os.path.join(app.static_folder, 'react'), path)
    return send_from_directory(os.path.join(app.static_folder, 'react'), 'index.html')

@app.route('/api/transform', methods=['POST'])
def transform():
    try:
        data = request.get_json()
        input_text = data.get('text', '')
        verbosity_level = int(data.get('verbosity', 1))
        
        if not input_text:
            return jsonify({'error': 'No text provided'}), 400
            
        transformed_text = transform_text(input_text, verbosity_level)
        
        transformation = Transformation(
            input_text=input_text,
            output_text=transformed_text,
            verbosity_level=verbosity_level
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
def history():
    try:
        transformations = Transformation.query.order_by(
            Transformation.created_at.desc()
        ).all()
        return jsonify([{
            'id': t.id,
            'input_text': t.input_text,
            'output_text': t.output_text,
            'verbosity_level': t.verbosity_level,
            'created_at': t.created_at.isoformat()
        } for t in transformations])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
