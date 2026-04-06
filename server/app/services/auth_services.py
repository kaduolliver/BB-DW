from datetime import datetime, timedelta
from flask import session
from sqlalchemy import text
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
from app.utils.security import hash_senha, verificar_senha
from app.utils.validators import validar_campos_obrigatorios

MAX_TENTATIVAS_LOGIN = 3
TEMPO_BLOQUEIO_MINUTOS = 5


def registrar_usuario(data):
    db = SessionLocal()
    try:
        obrigatorios = ["nome", "email", "senha", "role"]
        ok, msg = validar_campos_obrigatorios(data, obrigatorios)
        if not ok:
            raise ValidationError(msg)

        nome = data["nome"].strip()
        email = data["email"].strip().lower()
        senha = data["senha"]
        role = data["role"].strip().lower()

        if role not in ["admin", "curator", "speaker"]:
            raise ValidationError(
                "Role de usuário inválida. Use admin, curator ou speaker.",
                {"field": "role", "allowed_values": ["admin", "curator", "speaker"]},
            )

        senha_hash = hash_senha(senha)

        novo_usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=senha_hash,
            role=role,
        )

        db.add(novo_usuario)
        db.flush()

        if role == "speaker":
            novo_speaker = Speaker(id_usuario=novo_usuario.id_usuario)
            db.add(novo_speaker)

        db.commit()

        return {
            "success": True,
            "message": "Usuário registrado com sucesso!",
            "data": {
                "id_usuario": novo_usuario.id_usuario,
                "nome": novo_usuario.nome,
                "email": novo_usuario.email,
                "role": novo_usuario.role,
            },
        }, 201

    except IntegrityError as e:
        db.rollback()

        mensagem_erro = str(e).lower()
        if "email" in mensagem_erro or "unique" in mensagem_erro:
            raise ConflictError("E-mail já registrado.", {"field": "email"})

        raise ConflictError("Erro de integridade ao registrar usuário.")

    finally:
        db.close()


def login_usuario(data):
    db = SessionLocal()
    try:
        obrigatorios = ["email", "senha"]
        ok, msg = validar_campos_obrigatorios(data, obrigatorios)
        if not ok:
            raise ValidationError(msg)

        email = data["email"].strip().lower()
        senha = data["senha"]

        usuario = db.query(Usuario).filter_by(email=email).first()

        if not usuario:
            db.execute(
                text(
                    "SELECT fn_auditoria(NULL, 'FALHA_LOGIN', 'Tentativa para email não cadastrado');"
                )
            )
            db.commit()
            raise UnauthorizedError("E-mail ou senha inválidos.")

        if usuario.data_bloqueio:
            limite_bloqueio = usuario.data_bloqueio + timedelta(minutes=TEMPO_BLOQUEIO_MINUTOS)

            if datetime.now() < limite_bloqueio:
                raise ForbiddenError("Sua conta está bloqueada. Tente novamente em alguns minutos.")

            usuario.tentativas_login_falhas = 0
            usuario.data_bloqueio = None
            db.commit()

        if not verificar_senha(senha, usuario.senha_hash):
            usuario.tentativas_login_falhas += 1

            if usuario.tentativas_login_falhas >= MAX_TENTATIVAS_LOGIN:
                usuario.data_bloqueio = datetime.now()
                db.execute(
                    text(
                        "SELECT fn_auditoria(:id, 'CONTA_BLOQUEADA', 'Bloqueio por excesso de tentativas');"
                    ),
                    {"id": usuario.id_usuario},
                )
                db.commit()
                raise ForbiddenError("Muitas tentativas falhas. Conta bloqueada temporariamente.")

            db.commit()
            raise UnauthorizedError("E-mail ou senha inválidos.")

        usuario.tentativas_login_falhas = 0
        usuario.data_bloqueio = None

        db.execute(
            text("SELECT fn_auditoria(:id, 'LOGIN_SUCESSO', 'Usuário fez login');"),
            {"id": usuario.id_usuario},
        )
        db.commit()

        session["id_usuario"] = usuario.id_usuario
        session["role"] = usuario.role

        id_speaker = None
        if usuario.role == "speaker" and usuario.speaker_profile:
            id_speaker = usuario.speaker_profile.id_speaker
            session["id_speaker"] = id_speaker

        return {
            "success": True,
            "message": "Login realizado com sucesso!",
            "data": {
                "usuario": {
                    "id_usuario": usuario.id_usuario,
                    "nome": usuario.nome,
                    "email": usuario.email,
                    "role": usuario.role,
                    "id_speaker": id_speaker,
                }
            },
        }, 200

    finally:
        db.close()


def logout_usuario():
    db = SessionLocal()
    try:
        user_id = session.get("id_usuario")
        if not user_id:
            raise UnauthorizedError("Nenhum usuário logado na sessão.")

        db.execute(
            text("SELECT fn_auditoria(:id, 'LOGOUT', 'Usuário saiu do sistema');"),
            {"id": user_id},
        )
        db.commit()

        session.clear()

        return {
            "success": True,
            "message": "Logout realizado com sucesso.",
            "data": None,
        }, 200

    finally:
        db.close()


def verificar_sessao():
    if "id_usuario" not in session:
        raise UnauthorizedError("Usuário não autenticado.")

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter_by(id_usuario=session["id_usuario"]).first()

        if not usuario:
            session.clear()
            raise NotFoundError("Usuário não encontrado.", {"id_usuario": session.get("id_usuario")})

        return {
            "success": True,
            "message": "Sessão válida.",
            "data": {
                "autenticado": True,
                "usuario": {
                    "id_usuario": usuario.id_usuario,
                    "nome": usuario.nome,
                    "email": usuario.email,
                    "role": usuario.role,
                },
            },
        }, 200

    finally:
        db.close()