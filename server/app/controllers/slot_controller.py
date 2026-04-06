from app.services.slot_services import (
    get_all_slots as srv_get_all_slots,
    create_slot as srv_create_slot,
    update_slot as srv_update_slot,
    delete_slot as srv_delete_slot,
)


def get_all_slots():
    return srv_get_all_slots()


def create_slot(data):
    return srv_create_slot(data)


def update_slot(id_slot, data):
    return srv_update_slot(id_slot, data)


def delete_slot(id_slot):
    return srv_delete_slot(id_slot)