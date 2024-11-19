from flask import render_template, request, jsonify
from app import app, db
from models import Transformation
from utils.openai_helper import transform_text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transform', methods=['POST'])
def transform():
    try:
        data = request.get_json()
        input_text = data.get('text', '')
        verbosity_level = int(data.get('verbosity', 1))
        
        if not input_text:
            return jsonify({'error': 'No text provided'}), 400
            
        transformed_text = transform_text(input_text, verbosity_level)
        
        # Save to database
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

@app.route('/history')
def history():
    transformations = Transformation.query.order_by(
        Transformation.created_at.desc()
    ).all()
    return render_template('history.html', transformations=transformations)
