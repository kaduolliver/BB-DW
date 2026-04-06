from app.services.slot_services import (
    srv_get_all_slots,
    srv_create_slot,
    srv_update_slot,
    srv_delete_slot
)

def get_all_slots():
    try:
        return srv_get_all_slots()
    except Exception as e:
        return {"erro": str(e)}, 500

def create_slot(data):
    try:
        return srv_create_slot(data)
    except Exception as e:
        return {"erro": str(e)}, 500

def update_slot(id_slot, data):
    try:
        return srv_update_slot(id_slot, data)
    except Exception as e:
        return {"erro": str(e)}, 500

def delete_slot(id_slot):
    try:
        return srv_delete_slot(id_slot)
    except Exception as e:
        return {"erro": str(e)}, 500