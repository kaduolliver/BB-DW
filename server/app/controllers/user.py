from app.services.userData import (
    get_perfil_usuario,
    atualizar_usuario,
    atualizar_perfil_speaker
)

def user_get_perfil():
    try:
        resultado, status = get_perfil_usuario()
        return resultado, status
    except Exception as e:
        return {"erro": str(e)}, 500


def user_atualizar_usuario(data):
    try:
        resultado, status = atualizar_usuario(data)
        return resultado, status
    except Exception as e:
        return {"erro": str(e)}, 500


def user_atualizar_speaker(data):
    try:
        resultado, status = atualizar_perfil_speaker(data)
        return resultado, status
    except Exception as e:
        return {"erro": str(e)}, 500