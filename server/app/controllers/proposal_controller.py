from app.services.proposal_services import (
    srv_get_all_proposals,
    srv_create_proposal,
    srv_update_proposal,
    srv_delete_proposal
)

def get_all_proposals():
    try:
        return srv_get_all_proposals()
    except Exception as e:
        return {"erro": str(e)}, 500

def create_proposal(data):
    try:
        return srv_create_proposal(data)
    except Exception as e:
        return {"erro": str(e)}, 500

def update_proposal(id_proposal, data):
    try:
        return srv_update_proposal(id_proposal, data)
    except Exception as e:
        return {"erro": str(e)}, 500

def delete_proposal(id_proposal):
    try:
        return srv_delete_proposal(id_proposal)
    except Exception as e:
        return {"erro": str(e)}, 500