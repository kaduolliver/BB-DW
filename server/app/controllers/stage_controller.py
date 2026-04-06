from app.services.stage_services import (
    get_all_stages as srv_get_all_stages,
    create_stage as srv_create_stage,
    update_stage as srv_update_stage,
    delete_stage as srv_delete_stage,
)


def get_all_stages():
    return srv_get_all_stages()


def create_stage(data):
    return srv_create_stage(data)


def update_stage(id_stage, data):
    return srv_update_stage(id_stage, data)


def delete_stage(id_stage):
    return srv_delete_stage(id_stage)