from functools import wraps
from flask import Blueprint, jsonify
from flask_login import current_user, login_required

admin = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@admin.route('/api/admin/transformations', methods=['GET'])
@admin_required
def get_all_transformations():
    from models import Transformation
    transformations = Transformation.query.order_by(Transformation.created_at.desc()).all()
    return jsonify([t.to_dict() for t in transformations])

@admin.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    from models import User
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])
