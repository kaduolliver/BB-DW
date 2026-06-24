from flask import Blueprint, request, jsonify
from app.services.stage_services import (
    get_all_stages,
    create_stage,
    update_stage,
    delete_stage,
)

stage_bp = Blueprint("stage", __name__, url_prefix="/api/stages")


@stage_bp.get("")
def route_get_stages():
    resposta, status = get_all_stages()
    return jsonify(resposta), status


@stage_bp.post("")
def route_create_stage():
    resposta, status = create_stage(request.json)
    return jsonify(resposta), status


@stage_bp.put("/<int:id_stage>")
def route_update_stage(id_stage):
    resposta, status = update_stage(id_stage, request.json)
    return jsonify(resposta), status


@stage_bp.delete("/<int:id_stage>")
def route_delete_stage(id_stage):
    resposta, status = delete_stage(id_stage)
    return jsonify(resposta), status