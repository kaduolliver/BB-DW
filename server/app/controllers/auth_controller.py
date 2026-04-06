from flask import session

from app.services.auth_services import (
    registrar_usuario as srv_registrar_usuario,
    login_usuario as srv_login_usuario,
    verificar_sessao as srv_verificar_sessao,
    logout_usuario as srv_logout_usuario
)

def registrar_usuario(data):
    try:
        return srv_registrar_usuario(data)
    except Exception as e:
        return {"erro": str(e)}, 500

def login_usuario(data):
    try:
        return srv_login_usuario(data)
    except Exception as e:
        return {"erro": str(e)}, 500

def verificar_sessao():
    try:
        return srv_verificar_sessao()
    except Exception as e:
        return {"erro": str(e)}, 500
    
def logout_usuario():
    try:
        return srv_logout_usuario()
    except Exception as e:
        return {"erro": str(e)}, 500

def user_get_profile():
    if 'id_usuario' not in session:
        return {'erro': 'Não autenticado'}, 401
    try:
        return srv_verificar_sessao()
    except Exception as e:
        return {'erro': str(e)}, 500