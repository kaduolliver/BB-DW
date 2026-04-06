from flask import Blueprint, request, jsonify
from app.controllers.stage_controller import (
    get_all_stages,
    create_stage,
    update_stage,
    delete_stage
)

stage_bp = Blueprint('stage', __name__)

# Buscar todos os palcos
@stage_bp.route('/api/stages', methods=['GET'])
def route_get_stages():
    resposta, status = get_all_stages()
    return jsonify(resposta), status

# Criar um novo palco
@stage_bp.route('/api/stages', methods=['POST'])
def route_create_stage():
    resposta, status = create_stage(request.json)
    return jsonify(resposta), status

# Atualizar um palco existente
@stage_bp.route('/api/stages/<int:id_stage>', methods=['PUT'])
def route_update_stage(id_stage):
    resposta, status = update_stage(id_stage, request.json)
    return jsonify(resposta), status

# (Opcional) Deletar um palco
@stage_bp.route('/api/stages/<int:id_stage>', methods=['DELETE'])
def route_delete_stage(id_stage):
    resposta, status = delete_stage(id_stage)
    return jsonify(resposta), status