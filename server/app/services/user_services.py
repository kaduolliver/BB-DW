from flask import session
from sqlalchemy.exc import IntegrityError

from app.database.db import SessionLocal
from app.exception import (
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
)
from app.models.usuario import Usuario
from app.models.speaker import Speaker


def serialize_user_profile(usuario):
    dados_perfil = {
        "id_usuario": usuario.id_usuario,
        "nome": usuario.nome,
        "email": usuario.email,
        "role": usuario.role,
        "criado_em": usuario.criado_em.strftime("%Y-%m-%d %H:%M:%S")
        if usuario.criado_em
        else None,
    }

    if usuario.role == "speaker" and usuario.speaker_profile:
        dados_perfil["bio"] = usuario.speaker_profile.bio
        dados_perfil["empresa"] = usuario.speaker_profile.empresa

    return dados_perfil


def get_perfil_usuario():
    if "id_usuario" not in session:
        raise UnauthorizedError("Usuário não autenticado.")

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter_by(id_usuario=session["id_usuario"]).first()
        if not usuario:
            raise NotFoundError(
                "Usuário não encontrado.",
                {"id_usuario": session["id_usuario"]},
            )

        return {
            "success": True,
            "message": "Perfil carregado com sucesso.",
            "data": serialize_user_profile(usuario),
        }, 200

    finally:
        db.close()


def atualizar_usuario(data):
    if "id_usuario" not in session:
        raise UnauthorizedError("Usuário não autenticado.")

    nome = data.get("nome")
    email = data.get("email")

    if not nome and not email:
        raise ValidationError("Nenhum dado fornecido para atualização.")

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter_by(id_usuario=session["id_usuario"]).first()
        if not usuario:
            raise NotFoundError(
                "Usuário não encontrado.",
                {"id_usuario": session["id_usuario"]},
            )

        if nome is not None:
            nome = nome.strip()
            if not nome:
                raise ValidationError("O nome não pode ser vazio.", {"field": "nome"})
            usuario.nome = nome

        if email is not None:
            email = email.strip().lower()
            if not email:
                raise ValidationError("O e-mail não pode ser vazio.", {"field": "email"})
            usuario.email = email

        db.commit()
        db.refresh(usuario)

        return {
            "success": True,
            "message": "Perfil atualizado com sucesso.",
            "data": serialize_user_profile(usuario),
        }, 200

    except IntegrityError:
        db.rollback()
        raise ConflictError(
            "Este e-mail já está em uso por outro usuário.",
            {"field": "email"},
        )

    finally:
        db.close()


def atualizar_perfil_speaker(data):
    if "id_usuario" not in session:
        raise UnauthorizedError("Usuário não autenticado.")

    if session.get("role") != "speaker":
        raise ForbiddenError("Apenas palestrantes podem acessar esta função.")

    bio = data.get("bio")
    empresa = data.get("empresa")

    if bio is None and empresa is None:
        raise ValidationError("Nenhum dado fornecido para atualização do perfil de palestrante.")

    db = SessionLocal()
    try:
        speaker = db.query(Speaker).filter_by(id_usuario=session["id_usuario"]).first()

        if not speaker:
            speaker = Speaker(id_usuario=session["id_usuario"])
            db.add(speaker)
            db.flush()

        if bio is not None:
            speaker.bio = bio

        if empresa is not None:
            speaker.empresa = empresa

        db.commit()
        db.refresh(speaker)

        usuario = db.query(Usuario).filter_by(id_usuario=session["id_usuario"]).first()

        return {
            "success": True,
            "message": "Perfil de palestrante atualizado com sucesso.",
            "data": serialize_user_profile(usuario),
        }, 200

    finally:
        db.close()