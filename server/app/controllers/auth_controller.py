from flask import session
from app.exception import UnauthorizedError
from app.services.auth_services import (
    registrar_usuario as srv_registrar_usuario,
    login_usuario as srv_login_usuario,
    verificar_sessao as srv_verificar_sessao,
    logout_usuario as srv_logout_usuario,
)


def registrar_usuario(data):
    return srv_registrar_usuario(data)


def login_usuario(data):
    return srv_login_usuario(data)


def verificar_sessao():
    return srv_verificar_sessao()


def logout_usuario():
    return srv_logout_usuario()


def user_get_profile():
    if "id_usuario" not in session:
        raise UnauthorizedError("Não autenticado.")

    return srv_verificar_sessao()