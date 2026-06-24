from app.models.usuario import Usuario

def test_crud_stage_track_session(client, db_session):
    # Register an admin
    client.post("/api/auth/register", json={
        "nome": "Admin",
        "email": "admin@example.com",
        "senha": "password123",
        "role": "admin"
    })
    client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "senha": "password123"
    })

    user = db_session.query(Usuario).filter_by(email="admin@example.com").first()
    
    # Create Stage
    resp_stage = client.post("/api/stages", json={
        "nome": "Palco Principal",
        "capacidade": 100,
        "duracao_slot": 25
    })
    assert resp_stage.status_code == 201
    stage_id = resp_stage.get_json()["data"]["id_stage"]
    
    # Create Track
    resp_track = client.post("/api/tracks", json={
        "nome": "Tecnologia",
        "descricao": "Trilha de tech"
    })
    assert resp_track.status_code == 201
    track_id = resp_track.get_json()["data"]["id_track"]

    # Create Slot
    resp_slot = client.post("/api/slots", json={
        "start_time": "2026-10-20 10:00:00",
        "duration_units": 1,
        "id_stage": stage_id
    })
    assert resp_slot.status_code == 201
    slot_id = resp_slot.get_json()["data"]["id_slot"]

    # Create Proposal
    resp_prop = client.post("/api/proposals", json={
        "titulo": "Proposta Sessao",
        "id_track": track_id,
        "id_creator": user.id_usuario
    })
    assert resp_prop.status_code == 201
    prop_id = resp_prop.get_json()["data"]["id_proposal"]
    
    # Create Session
    resp_session = client.post("/api/sessions", json={
        "id_proposal": prop_id,
        "id_slot": slot_id,
        "id_stage": stage_id,
        "id_track": track_id
    })
    assert resp_session.status_code == 201
    
    # List sessions
    get_resp = client.get("/api/sessions")
    assert get_resp.status_code == 200
    assert len(get_resp.get_json()["data"]) >= 1
