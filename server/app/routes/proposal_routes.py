from flask import Blueprint, request, jsonify
from app.services.proposal_services import (
    get_all_proposals,
    create_proposal,
    update_proposal,
    delete_proposal,
)

proposal_bp = Blueprint("proposal", __name__, url_prefix="/api/proposals")


@proposal_bp.get("")
def route_get_proposals():
    resposta, status = get_all_proposals()
    return jsonify(resposta), status


@proposal_bp.post("")
def route_create_proposal():
    resposta, status = create_proposal(request.json)
    return jsonify(resposta), status


@proposal_bp.put("/<int:id_proposal>")
def route_update_proposal(id_proposal):
    resposta, status = update_proposal(id_proposal, request.json)
    return jsonify(resposta), status


@proposal_bp.delete("/<int:id_proposal>")
def route_delete_proposal(id_proposal):
    resposta, status = delete_proposal(id_proposal)
    return jsonify(resposta), status