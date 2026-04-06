from app.services.session_services import (
    srv_get_all_sessions,
    srv_create_session,
    srv_delete_session
)

def get_all_sessions():
    try:
        return srv_get_all_sessions()
    except Exception as e:
        return {"erro": str(e)}, 500

def create_session(data):
    try:
        return srv_create_session(data)
    except Exception as e:
        return {"erro": str(e)}, 500

def delete_session(id_session):
    try:
        return srv_delete_session(id_session)
    except Exception as e:
        return {"erro": str(e)}, 500