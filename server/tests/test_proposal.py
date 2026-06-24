from app.models.proposal import Proposal
from app.models.usuario import Usuario

def test_create_and_get_proposal(client, db_session):
    client.post("/api/auth/register", json={
        "nome": "Speaker",
        "email": "speaker2@example.com",
        "senha": "password123",
        "role": "speaker"
    })
    
    login_resp = client.post("/api/auth/login", json={
        "email": "speaker2@example.com",
        "senha": "password123"
    })
    assert login_resp.status_code == 200

    # Create Track
    track_resp = client.post("/api/tracks", json={
        "nome": "Trilha Teste"
    })
    track_id = track_resp.get_json()["data"]["id_track"]

    user = db_session.query(Usuario).filter_by(email="speaker2@example.com").first()
    
    prop_data = {
        "titulo": "Nova Proposta Teste",
        "descricao": "Descricao teste",
        "id_track": track_id,
        "id_creator": user.id_usuario
    }
    
    response = client.post("/api/proposals", json=prop_data)
    assert response.status_code == 201
    
    # Verify in DB
    proposal = db_session.query(Proposal).filter_by(titulo="Nova Proposta Teste").first()
    assert proposal is not None
    assert proposal.status == "PENDING"
    
    # Verify GET
    get_resp = client.get("/api/proposals")
    assert get_resp.status_code == 200
    data = get_resp.get_json()
    
    found = False
    for p in data["data"]:
        if p["titulo"] == "Nova Proposta Teste":
            found = True
    assert found
