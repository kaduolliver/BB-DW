from flask import Blueprint, request, jsonify
from app.controllers.proposal_controller import (
    get_all_proposals,
    create_proposal,
    update_proposal,
    delete_proposal
)

proposal_bp = Blueprint('proposal', __name__)

@proposal_bp.route('/api/proposals', methods=['GET'])
def route_get_proposals():
    resposta, status = get_all_proposals()
    return jsonify(resposta), status

@proposal_bp.route('/api/proposals', methods=['POST'])
def route_create_proposal():
    resposta, status = create_proposal(request.json)
    return jsonify(resposta), status

@proposal_bp.route('/api/proposals/<int:id_proposal>', methods=['PUT'])
def route_update_proposal(id_proposal):
    resposta, status = update_proposal(id_proposal, request.json)
    return jsonify(resposta), status

@proposal_bp.route('/api/proposals/<int:id_proposal>', methods=['DELETE'])
def route_delete_proposal(id_proposal):
    resposta, status = delete_proposal(id_proposal)
    return jsonify(resposta), status