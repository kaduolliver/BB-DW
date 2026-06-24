from flask import Blueprint, request, jsonify
from app.services.user_services import (
    get_perfil_usuario,
    atualizar_usuario,
    atualizar_perfil_speaker,
)

user_bp = Blueprint("usuario", __name__, url_prefix="/api/usuario")


@user_bp.get("/perfil")
def get_perfil_route():
    resposta, status = get_perfil_usuario()
    return jsonify(resposta), status


@user_bp.put("/perfil")
def atualizar_usuario_route():
    resposta, status = atualizar_usuario(request.json)
    return jsonify(resposta), status


@user_bp.put("/speaker")
def atualizar_speaker_route():
    resposta, status = atualizar_perfil_speaker(request.json)
    return jsonify(resposta), status