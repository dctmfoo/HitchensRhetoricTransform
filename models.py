from datetime import datetime
from extensions import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class Transformation(db.Model):
    __tablename__ = 'transformation'
    id = db.Column(db.Integer, primary_key=True)
    input_text = db.Column(db.Text, nullable=False)
    output_text = db.Column(db.Text, nullable=False)
    verbosity_level = db.Column(db.Integer, nullable=False)
    persona = db.Column(db.String(50), nullable=False, default='hitchens')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    api_provider = db.Column(db.String(50), nullable=False, default='openai')
    
    user = db.relationship('User', backref=db.backref('transformations', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'input_text': self.input_text,
            'output_text': self.output_text,
            'verbosity_level': self.verbosity_level,
            'persona': self.persona,
            'api_provider': self.api_provider,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'user_id': self.user_id,
            'username': self.user.username if self.user else None
        }
