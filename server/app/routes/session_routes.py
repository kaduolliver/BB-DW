from flask import Blueprint, request, jsonify
from app.controllers.session_controller import (
    get_all_sessions,
    create_session,
    delete_session
)

session_bp = Blueprint('session', __name__)

@session_bp.route('/api/sessions', methods=['GET'])
def route_get_sessions():
    resposta, status = get_all_sessions()
    return jsonify(resposta), status

@session_bp.route('/api/sessions', methods=['POST'])
def route_create_session():
    resposta, status = create_session(request.json)
    return jsonify(resposta), status

@session_bp.route('/api/sessions/<int:id_session>', methods=['DELETE'])
def route_delete_session(id_session):
    resposta, status = delete_session(id_session)
    return jsonify(resposta), status