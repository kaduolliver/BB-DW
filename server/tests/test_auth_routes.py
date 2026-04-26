from unittest.mock import patch

def test_register(client):
    with patch("app.routes.auth_routes.registrar_usuario") as mock_controller:
        mock_controller.return_value = ({"message": "success"}, 201)
        response = client.post("/api/auth/register", json={"email": "test@test.com"})
        assert response.status_code == 201
        assert response.json == {"message": "success"}

def test_login(client):
    with patch("app.routes.auth_routes.login_usuario") as mock_controller:
        mock_controller.return_value = ({"token": "abc"}, 200)
        response = client.post("/api/auth/login", json={"email": "test@test.com"})
        assert response.status_code == 200
        assert response.json == {"token": "abc"}

def test_session_route(client):
    with patch("app.routes.auth_routes.verificar_sessao") as mock_controller:
        mock_controller.return_value = ({"autenticado": True}, 200)
        response = client.get("/api/auth/session")
        assert response.status_code == 200
        assert response.json == {"autenticado": True}

def test_logout(client):
    with patch("app.routes.auth_routes.logout_usuario") as mock_controller:
        mock_controller.return_value = ({"message": "logged out"}, 200)
        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        assert response.json == {"message": "logged out"}
