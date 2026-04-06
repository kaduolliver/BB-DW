from app.services.session_services import (
    get_all_sessions as srv_get_all_sessions,
    create_session as srv_create_session,
    delete_session as srv_delete_session,
)


def get_all_sessions():
    return srv_get_all_sessions()


def create_session(data):
    return srv_create_session(data)


def delete_session(id_session):
    return srv_delete_session(id_session)