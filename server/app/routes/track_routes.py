from flask import Blueprint, request, jsonify
from app.services.track_services import (
    get_all_tracks,
    create_track,
    update_track,
    delete_track,
)

track_bp = Blueprint("track", __name__, url_prefix="/api/tracks")


@track_bp.get("")
def route_get_tracks():
    resposta, status = get_all_tracks()
    return jsonify(resposta), status


@track_bp.post("")
def route_create_track():
    resposta, status = create_track(request.json)
    return jsonify(resposta), status


@track_bp.put("/<int:id_track>")
def route_update_track(id_track):
    resposta, status = update_track(id_track, request.json)
    return jsonify(resposta), status


@track_bp.delete("/<int:id_track>")
def route_delete_track(id_track):
    resposta, status = delete_track(id_track)
    return jsonify(resposta), status