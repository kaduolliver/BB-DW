from app.services.auth_services import registrar_usuario, login_usuario
from app.models.usuario import Usuario

def test_registrar_usuario(app, db_session):
    data = {
        "nome": "Test User",
        "email": "test@example.com",
        "senha": "password123",
        "role": "speaker"
    }
    
    with app.test_request_context():
        response, status = registrar_usuario(data)
        
        assert status == 201
        assert response["success"] is True
        assert response["message"] == "Usuário registrado com sucesso!"
        
        # Verify it's in the DB
        user = db_session.query(Usuario).filter_by(email="test@example.com").first()
        assert user is not None
        assert user.nome == "Test User"
        assert user.role == "speaker"

def test_login_usuario(app, db_session):
    # First register
    register_data = {
        "nome": "Test Login User",
        "email": "login@example.com",
        "senha": "password123",
        "role": "admin"
    }
    with app.test_request_context():
        registrar_usuario(register_data)
        
        # Now login
        login_data = {
            "email": "login@example.com",
            "senha": "password123"
        }
        
        response, status = login_usuario(login_data)
        
        assert status == 200
        assert response["success"] is True
        assert response["data"]["usuario"]["email"] == "login@example.com"
