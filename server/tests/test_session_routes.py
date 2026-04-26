from unittest.mock import patch

def test_get_sessions(client):
    with patch("app.routes.session_routes.get_all_sessions") as mock_controller:
        mock_controller.return_value = ([{"id": 1}], 200)
        response = client.get("/api/sessions")
        assert response.status_code == 200
        assert response.json == [{"id": 1}]

def test_create_session(client):
    with patch("app.routes.session_routes.create_session") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 201)
        response = client.post("/api/sessions", json={"title": "Test"})
        assert response.status_code == 201
        assert response.json == {"id": 1}

def test_delete_session(client):
    with patch("app.routes.session_routes.delete_session") as mock_controller:
        mock_controller.return_value = ({"message": "deleted"}, 200)
        response = client.delete("/api/sessions/1")
        assert response.status_code == 200
        assert response.json == {"message": "deleted"}
