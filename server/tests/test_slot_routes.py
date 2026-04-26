from unittest.mock import patch

def test_get_slots(client):
    with patch("app.routes.slot_routes.get_all_slots") as mock_controller:
        mock_controller.return_value = ([{"id": 1}], 200)
        response = client.get("/api/slots")
        assert response.status_code == 200
        assert response.json == [{"id": 1}]

def test_create_slot(client):
    with patch("app.routes.slot_routes.create_slot") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 201)
        response = client.post("/api/slots", json={"time": "10:00"})
        assert response.status_code == 201
        assert response.json == {"id": 1}

def test_update_slot(client):
    with patch("app.routes.slot_routes.update_slot") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 200)
        response = client.put("/api/slots/1", json={"time": "11:00"})
        assert response.status_code == 200
        assert response.json == {"id": 1}

def test_delete_slot(client):
    with patch("app.routes.slot_routes.delete_slot") as mock_controller:
        mock_controller.return_value = ({"message": "deleted"}, 200)
        response = client.delete("/api/slots/1")
        assert response.status_code == 200
        assert response.json == {"message": "deleted"}
