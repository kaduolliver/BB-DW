from flask import Blueprint, request, jsonify
from app.services.slot_services import (
    get_all_slots,
    create_slot,
    update_slot,
    delete_slot,
)

slot_bp = Blueprint("slot", __name__, url_prefix="/api/slots")


@slot_bp.get("")
def route_get_slots():
    resposta, status = get_all_slots()
    return jsonify(resposta), status


@slot_bp.post("")
def route_create_slot():
    resposta, status = create_slot(request.json)
    return jsonify(resposta), status


@slot_bp.put("/<int:id_slot>")
def route_update_slot(id_slot):
    resposta, status = update_slot(id_slot, request.json)
    return jsonify(resposta), status


@slot_bp.delete("/<int:id_slot>")
def route_delete_slot(id_slot):
    resposta, status = delete_slot(id_slot)
    return jsonify(resposta), status