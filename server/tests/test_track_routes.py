from unittest.mock import patch

def test_get_tracks(client):
    with patch("app.routes.track_routes.get_all_tracks") as mock_controller:
        mock_controller.return_value = ([{"id": 1}], 200)
        response = client.get("/api/tracks")
        assert response.status_code == 200
        assert response.json == [{"id": 1}]

def test_create_track(client):
    with patch("app.routes.track_routes.create_track") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 201)
        response = client.post("/api/tracks", json={"name": "Test Track"})
        assert response.status_code == 201
        assert response.json == {"id": 1}

def test_update_track(client):
    with patch("app.routes.track_routes.update_track") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 200)
        response = client.put("/api/tracks/1", json={"name": "Updated Track"})
        assert response.status_code == 200
        assert response.json == {"id": 1}

def test_delete_track(client):
    with patch("app.routes.track_routes.delete_track") as mock_controller:
        mock_controller.return_value = ({"message": "deleted"}, 200)
        response = client.delete("/api/tracks/1")
        assert response.status_code == 200
        assert response.json == {"message": "deleted"}
