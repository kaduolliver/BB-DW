from app.services.track_services import (
    get_all_tracks as srv_get_all_tracks,
    create_track as srv_create_track,
    update_track as srv_update_track,
    delete_track as srv_delete_track,
)


def get_all_tracks():
    return srv_get_all_tracks()


def create_track(data):
    return srv_create_track(data)


def update_track(id_track, data):
    return srv_update_track(id_track, data)


def delete_track(id_track):
    return srv_delete_track(id_track)