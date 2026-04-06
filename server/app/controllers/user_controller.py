from app.services.user_services import (
    get_perfil_usuario as srv_get_perfil_usuario,
    atualizar_usuario as srv_atualizar_usuario,
    atualizar_perfil_speaker as srv_atualizar_perfil_speaker,
)


def user_get_perfil():
    return srv_get_perfil_usuario()


def user_atualizar_usuario(data):
    return srv_atualizar_usuario(data)


def user_atualizar_speaker(data):
    return srv_atualizar_perfil_speaker(data)