from app.services.proposal_services import (
    get_all_proposals as srv_get_all_proposals,
    create_proposal as srv_create_proposal,
    update_proposal as srv_update_proposal,
    delete_proposal as srv_delete_proposal,
)


def get_all_proposals():
    return srv_get_all_proposals()

def create_proposal(data):
    return srv_create_proposal(data)

def update_proposal(id_proposal, data):
    return srv_update_proposal(id_proposal, data)

def delete_proposal(id_proposal):
    return srv_delete_proposal(id_proposal)