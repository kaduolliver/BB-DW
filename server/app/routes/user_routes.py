from flask import Blueprint, request, jsonify
from app.controllers.user import (
    user_get_perfil,
    user_atualizar_usuario,
    user_atualizar_speaker
)

user_bp = Blueprint('usuario', __name__)

# Rota para buscar os dados do perfil (básico + speaker, se houver)
@user_bp.route('/api/usuario/perfil', methods=['GET'])
def get_perfil_route():
    resposta, status = user_get_perfil()
    return jsonify(resposta), status

# Rota para atualizar os dados básicos do usuário (nome, email)
@user_bp.route('/api/usuario/perfil', methods=['PUT'])
def atualizar_usuario_route():
    resposta, status = user_atualizar_usuario(request.json)
    return jsonify(resposta), status

# Rota exclusiva para palestrantes atualizarem bio e empresa
@user_bp.route('/api/usuario/speaker', methods=['PUT'])
def atualizar_speaker_route():
    resposta, status = user_atualizar_speaker(request.json)
    return jsonify(resposta), status