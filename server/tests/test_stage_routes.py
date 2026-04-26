from unittest.mock import patch

def test_get_stages(client):
    with patch("app.routes.stage_routes.get_all_stages") as mock_controller:
        mock_controller.return_value = ([{"id": 1}], 200)
        response = client.get("/api/stages")
        assert response.status_code == 200
        assert response.json == [{"id": 1}]

def test_create_stage(client):
    with patch("app.routes.stage_routes.create_stage") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 201)
        response = client.post("/api/stages", json={"name": "Test Stage"})
        assert response.status_code == 201
        assert response.json == {"id": 1}

def test_update_stage(client):
    with patch("app.routes.stage_routes.update_stage") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 200)
        response = client.put("/api/stages/1", json={"name": "Updated Stage"})
        assert response.status_code == 200
        assert response.json == {"id": 1}

def test_delete_stage(client):
    with patch("app.routes.stage_routes.delete_stage") as mock_controller:
        mock_controller.return_value = ({"message": "deleted"}, 200)
        response = client.delete("/api/stages/1")
        assert response.status_code == 200
        assert response.json == {"message": "deleted"}
