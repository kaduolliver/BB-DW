from unittest.mock import patch

def test_get_perfil_route(client):
    with patch("app.routes.user_routes.user_get_perfil") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 200)
        response = client.get("/api/usuario/perfil")
        assert response.status_code == 200
        assert response.json == {"id": 1}

def test_atualizar_usuario_route(client):
    with patch("app.routes.user_routes.user_atualizar_usuario") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 200)
        response = client.put("/api/usuario/perfil", json={"name": "Test"})
        assert response.status_code == 200
        assert response.json == {"id": 1}

def test_atualizar_speaker_route(client):
    with patch("app.routes.user_routes.user_atualizar_speaker") as mock_controller:
        mock_controller.return_value = ({"id": 1}, 200)
        response = client.put("/api/usuario/speaker", json={"bio": "Test"})
        assert response.status_code == 200
        assert response.json == {"id": 1}
