"""
Blueprint /api/ia — Épico 3 (Inteligência e Detecção de Conflitos)

Endpoints:
  GET  /api/ia/conflicts/speaker/<id_speaker>/<id_slot>  → HU 3.1 conflito de palestrante
  GET  /api/ia/conflicts/keynote/<id_slot>               → HU 3.1 bloqueio por keynote
  POST /api/ia/similarity                                → HU 3.2 comparar 2 sessões
  GET  /api/ia/similarity/scan/<id_slot>                 → HU 3.2 escanear todas as sessões do slot
"""

from flask import Blueprint, request, jsonify

from app.ia.ia_controller import (
    ctrl_speaker_conflict,
    ctrl_keynote_block,
    ctrl_compare_sessions,
    ctrl_scan_slot,
)

ia_bp = Blueprint("ia", __name__, url_prefix="/api/ia")


# ── HU 3.1 — Conflitos sem IA ───────────────────────────────────────────────

@ia_bp.get("/conflicts/speaker/<int:id_speaker>/<int:id_slot>")
def route_speaker_conflict(id_speaker: int, id_slot: int):
    """
    Verifica se um palestrante tem conflito de horário para o slot informado.

    Resposta 200: palestrante disponível
    Resposta 409: conflito detectado
    """
    resposta, status = ctrl_speaker_conflict(id_speaker, id_slot)
    return jsonify(resposta), status


@ia_bp.get("/conflicts/keynote/<int:id_slot>")
def route_keynote_block(id_slot: int):
    """
    Verifica se existe um keynote bloqueando o auditório no horário do slot.

    Resposta 200: auditório livre
    Resposta 409: bloqueado por keynote
    """
    resposta, status = ctrl_keynote_block(id_slot)
    return jsonify(resposta), status


# ── HU 3.2 — Similaridade temática via LLM ──────────────────────────────────

@ia_bp.post("/similarity")
def route_compare_sessions():
    """
    Compara duas sessões semanticamente via LLM local (Ollama).

    Body JSON esperado:
        { "id_session_a": int, "id_session_b": int }

    Resposta 200: análise concluída (campo `data.alert` indica sobreposição)
    Resposta 4xx/5xx: erro de validação ou de comunicação com o Ollama
    """
    data = request.get_json(silent=True) or {}

    id_a = data.get("id_session_a")
    id_b = data.get("id_session_b")

    if id_a is None or id_b is None:
        return jsonify({
            "success": False,
            "data": None,
            "message": "Campos obrigatórios: id_session_a e id_session_b.",
        }), 400

    try:
        id_a = int(id_a)
        id_b = int(id_b)
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "data": None,
            "message": "id_session_a e id_session_b devem ser inteiros.",
        }), 400

    resposta, status = ctrl_compare_sessions(id_a, id_b)
    return jsonify(resposta), status


@ia_bp.get("/similarity/scan/<int:id_slot>")
def route_scan_slot(id_slot: int):
    """
    Escaneia todas as sessões simultâneas de um slot e detecta sobreposições
    temáticas via LLM. Retorna apenas os pares com alerta.

    Resposta 200: scan concluído (campo `data.alerts` contém os pares problemáticos)
    Resposta 5xx: erro de comunicação com o Ollama
    """
    resposta, status = ctrl_scan_slot(id_slot)
    return jsonify(resposta), status
