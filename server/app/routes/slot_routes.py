from flask import Blueprint, request, jsonify
from app.controllers.slot_controller import (
    get_all_slots,
    create_slot,
    update_slot,
    delete_slot
)

slot_bp = Blueprint('slot', __name__)

@slot_bp.route('/api/slots', methods=['GET'])
def route_get_slots():
    resposta, status = get_all_slots()
    return jsonify(resposta), status

@slot_bp.route('/api/slots', methods=['POST'])
def route_create_slot():
    resposta, status = create_slot(request.json)
    return jsonify(resposta), status

@slot_bp.route('/api/slots/<int:id_slot>', methods=['PUT'])
def route_update_slot(id_slot):
    resposta, status = update_slot(id_slot, request.json)
    return jsonify(resposta), status

@slot_bp.route('/api/slots/<int:id_slot>', methods=['DELETE'])
def route_delete_slot(id_slot):
    resposta, status = delete_slot(id_slot)
    return jsonify(resposta), status