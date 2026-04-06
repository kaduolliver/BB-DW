from flask import Blueprint, request, jsonify
from app.controllers.user_controller import (
    user_get_perfil,
    user_atualizar_usuario,
    user_atualizar_speaker,
)

user_bp = Blueprint("usuario", __name__, url_prefix="/api/usuario")


@user_bp.get("/perfil")
def get_perfil_route():
    resposta, status = user_get_perfil()
    return jsonify(resposta), status


@user_bp.put("/perfil")
def atualizar_usuario_route():
    resposta, status = user_atualizar_usuario(request.json)
    return jsonify(resposta), status


@user_bp.put("/speaker")
def atualizar_speaker_route():
    resposta, status = user_atualizar_speaker(request.json)
    return jsonify(resposta), status