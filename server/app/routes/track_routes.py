from flask import Blueprint, request, jsonify
from app.controllers.track_controller import (
    get_all_tracks,
    create_track,
    update_track,
    delete_track
)

track_bp = Blueprint('track', __name__)

@track_bp.route('/api/tracks', methods=['GET'])
def route_get_tracks():
    resposta, status = get_all_tracks()
    return jsonify(resposta), status

@track_bp.route('/api/tracks', methods=['POST'])
def route_create_track():
    resposta, status = create_track(request.json)
    return jsonify(resposta), status

@track_bp.route('/api/tracks/<int:id_track>', methods=['PUT'])
def route_update_track(id_track):
    resposta, status = update_track(id_track, request.json)
    return jsonify(resposta), status

@track_bp.route('/api/tracks/<int:id_track>', methods=['DELETE'])
def route_delete_track(id_track):
    resposta, status = delete_track(id_track)
    return jsonify(resposta), status