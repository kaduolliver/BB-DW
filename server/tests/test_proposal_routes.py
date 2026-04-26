from unittest.mock import patch

def test_get_proposals(client):
    with patch("app.routes.proposal_routes.get_all_proposals") as mock_controller:
        mock_controller.return_value = ([{"id": 1}], 200)
        response = client.get("/api/proposals")
        assert response.status_code == 200
        assert response.json == [{"id": 1}]

def test_create_proposal(client):
    with patch("app.routes.proposal_routes.create_proposal") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 201)
        response = client.post("/api/proposals", json={"title": "Test"})
        assert response.status_code == 201
        assert response.json == {"id": 1}

def test_update_proposal(client):
    with patch("app.routes.proposal_routes.update_proposal") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 200)
        response = client.put("/api/proposals/1", json={"title": "Updated"})
        assert response.status_code == 200
        assert response.json == {"id": 1}

def test_delete_proposal(client):
    with patch("app.routes.proposal_routes.delete_proposal") as mock_controller:
        mock_controller.return_value = ({"message": "deleted"}, 200)
        response = client.delete("/api/proposals/1")
        assert response.status_code == 200
        assert response.json == {"message": "deleted"}
