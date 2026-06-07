from app.services.speaker_services import (
    get_all_speakers as srv_get_all_speakers,
    get_speaker_by_id as srv_get_speaker_by_id,
    create_speaker as srv_create_speaker,
    update_speaker as srv_update_speaker,
    delete_speaker as srv_delete_speaker,
)


def get_all_speakers():
    return srv_get_all_speakers()


def get_speaker_by_id(id_speaker):
    return srv_get_speaker_by_id(id_speaker)


def create_speaker(data):
    return srv_create_speaker(data)


def update_speaker(id_speaker, data):
    return srv_update_speaker(id_speaker, data)


def delete_speaker(id_speaker):
    return srv_delete_speaker(id_speaker)
