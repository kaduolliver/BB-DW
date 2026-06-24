from flask import Blueprint, request, jsonify
from app.services.session_services import (
    get_all_sessions,
    create_session,
    delete_session,
)

session_bp = Blueprint("session", __name__, url_prefix="/api/sessions")


@session_bp.get("")
def route_get_sessions():
    resposta, status = get_all_sessions()
    return jsonify(resposta), status


@session_bp.post("")
def route_create_session():
    resposta, status = create_session(request.json)
    return jsonify(resposta), status


@session_bp.delete("/<int:id_session>")
def route_delete_session(id_session):
    resposta, status = delete_session(id_session)
    return jsonify(resposta), status