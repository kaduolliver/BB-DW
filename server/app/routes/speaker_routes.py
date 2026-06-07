from flask import Blueprint, request, jsonify
from app.controllers.speaker_controller import (
    get_all_speakers,
    get_speaker_by_id,
    create_speaker,
    update_speaker,
    delete_speaker,
)

speaker_bp = Blueprint("speaker", __name__, url_prefix="/api/speakers")


@speaker_bp.get("")
def route_get_speakers():
    """Lista todos os palestrantes (usuários com role='speaker')."""
    resposta, status = get_all_speakers()
    return jsonify(resposta), status


@speaker_bp.get("/<int:id_speaker>")
def route_get_speaker(id_speaker):
    """Retorna um palestrante pelo id_speaker."""
    resposta, status = get_speaker_by_id(id_speaker)
    return jsonify(resposta), status


@speaker_bp.post("")
def route_create_speaker():
    """
    Cria um novo palestrante.
    Body: { nome, email, senha, bio?, empresa? }
    """
    resposta, status = create_speaker(request.json)
    return jsonify(resposta), status


@speaker_bp.put("/<int:id_speaker>")
def route_update_speaker(id_speaker):
    """
    Atualiza dados do palestrante (nome, email, bio, empresa).
    Body: campos a atualizar (todos opcionais).
    """
    resposta, status = update_speaker(id_speaker, request.json)
    return jsonify(resposta), status


@speaker_bp.delete("/<int:id_speaker>")
def route_delete_speaker(id_speaker):
    """Remove o perfil de speaker e o usuário vinculado."""
    resposta, status = delete_speaker(id_speaker)
    return jsonify(resposta), status
