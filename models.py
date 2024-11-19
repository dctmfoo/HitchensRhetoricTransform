from datetime import datetime
from app import db

class Transformation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    input_text = db.Column(db.Text, nullable=False)
    output_text = db.Column(db.Text, nullable=False)
    verbosity_level = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'input_text': self.input_text,
            'output_text': self.output_text,
            'verbosity_level': self.verbosity_level,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
