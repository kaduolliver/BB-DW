from unittest.mock import patch

def test_speaker_conflict(client):
    with patch("app.ia.ia_routes.ctrl_speaker_conflict") as mock_controller:
        mock_controller.return_value = ({"conflict": False}, 200)
        response = client.get("/api/ia/conflicts/speaker/1/2")
        assert response.status_code == 200
        assert response.json == {"conflict": False}

def test_keynote_block(client):
    with patch("app.ia.ia_routes.ctrl_keynote_block") as mock_controller:
        mock_controller.return_value = ({"block": True}, 200)
        response = client.get("/api/ia/conflicts/keynote/1")
        assert response.status_code == 200
        assert response.json == {"block": True}

def test_compare_sessions(client):
    with patch("app.ia.ia_routes.ctrl_compare_sessions") as mock_controller:
        mock_controller.return_value = ({"similarity": 0.9}, 200)
        response = client.post("/api/ia/similarity", json={"id_session_a": 1, "id_session_b": 2})
        assert response.status_code == 200
        assert response.json == {"similarity": 0.9}

def test_scan_slot(client):
    with patch("app.ia.ia_routes.ctrl_scan_slot") as mock_controller:
        mock_controller.return_value = ({"scanned": True}, 200)
        response = client.get("/api/ia/similarity/scan/1")
        assert response.status_code == 200
        assert response.json == {"scanned": True}
