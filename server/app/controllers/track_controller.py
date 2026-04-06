from app.services.track_services import (
    srv_get_all_tracks,
    srv_create_track,
    srv_update_track,
    srv_delete_track
)

def get_all_tracks():
    try:
        return srv_get_all_tracks()
    except Exception as e:
        return {"erro": str(e)}, 500

def create_track(data):
    try:
        return srv_create_track(data)
    except Exception as e:
        return {"erro": str(e)}, 500

def update_track(id_track, data):
    try:
        return srv_update_track(id_track, data)
    except Exception as e:
        return {"erro": str(e)}, 500

def delete_track(id_track):
    try:
        return srv_delete_track(id_track)
    except Exception as e:
        return {"erro": str(e)}, 500