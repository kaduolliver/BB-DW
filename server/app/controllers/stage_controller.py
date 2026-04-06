from app.services.stage_services import (
    srv_get_all_stages,
    srv_create_stage,
    srv_update_stage,
    srv_delete_stage
)

def get_all_stages():
    try:
        return srv_get_all_stages()
    except Exception as e:
        return {"erro": str(e)}, 500

def create_stage(data):
    try:
        return srv_create_stage(data)
    except Exception as e:
        return {"erro": str(e)}, 500

def update_stage(id_stage, data):
    try:
        return srv_update_stage(id_stage, data)
    except Exception as e:
        return {"erro": str(e)}, 500

def delete_stage(id_stage):
    try:
        return srv_delete_stage(id_stage)
    except Exception as e:
        return {"erro": str(e)}, 500