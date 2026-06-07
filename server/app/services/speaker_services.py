from sqlalchemy.exc import IntegrityError

from app.database.db import SessionLocal
from app.exception import ValidationError, NotFoundError, ConflictError
from app.models.speaker import Speaker
from app.models.usuario import Usuario


def serialize_speaker(speaker):
    """Serializa um Speaker junto com os dados do usuário vinculado."""
    usuario = speaker.usuario if speaker.usuario else None
    return {
        "id_speaker": speaker.id_speaker,
        "id_usuario": speaker.id_usuario,
        "nome": usuario.nome if usuario else None,
        "email": usuario.email if usuario else None,
        "bio": speaker.bio,
        "empresa": speaker.empresa,
    }


def get_all_speakers():
    db = SessionLocal()
    try:
        speakers = (
            db.query(Speaker)
            .join(Usuario, Speaker.id_usuario == Usuario.id_usuario)
            .all()
        )
        resultado = [serialize_speaker(s) for s in speakers]

        return {
            "success": True,
            "message": "Palestrantes listados com sucesso.",
            "data": resultado,
        }, 200

    finally:
        db.close()


def get_speaker_by_id(id_speaker):
    db = SessionLocal()
    try:
        speaker = db.query(Speaker).filter_by(id_speaker=id_speaker).first()
        if not speaker:
            raise NotFoundError(
                "Palestrante não encontrado.",
                {"id_speaker": id_speaker},
            )

        return {
            "success": True,
            "message": "Palestrante encontrado.",
            "data": serialize_speaker(speaker),
        }, 200

    finally:
        db.close()


def create_speaker(data):
    """
    Cria um novo usuário com role='speaker' e o perfil de speaker vinculado.
    Campos esperados: nome, email, senha, bio (opt), empresa (opt)
    Delega a criação do usuário+speaker para registrar_usuario (auth_services).
    """
    from app.services.auth_services import registrar_usuario

    db = SessionLocal()
    try:
        # Cria usuário com role='speaker' usando o serviço existente
        registrar_usuario({
            "nome":  data.get("nome", ""),
            "email": data.get("email", ""),
            "senha": data.get("senha", ""),
            "role":  "speaker",
        })

        # Busca o speaker recém-criado pelo email para atualizar bio/empresa
        email = data.get("email", "").strip().lower()
        usuario = db.query(Usuario).filter_by(email=email).first()

        if not usuario or not usuario.speaker_profile:
            raise ValidationError("Palestrante criado mas perfil não encontrado.")

        speaker = usuario.speaker_profile
        if data.get("bio"):
            speaker.bio = data["bio"]
        if data.get("empresa"):
            speaker.empresa = data["empresa"]

        db.commit()
        db.refresh(speaker)

        return {
            "success": True,
            "message": "Palestrante criado com sucesso!",
            "data": serialize_speaker(speaker),
        }, 201

    except IntegrityError as e:
        db.rollback()
        erro = str(e).lower()
        if "email" in erro or "unique" in erro:
            raise ConflictError(
                "Já existe um usuário com este e-mail.", {"field": "email"}
            )
        raise ConflictError("Erro de integridade ao criar palestrante.")

    finally:
        db.close()



def update_speaker(id_speaker, data):
    """
    Atualiza os dados do perfil de speaker e/ou do usuário vinculado.
    Campos atualizáveis: nome, email, bio, empresa
    """
    db = SessionLocal()
    try:
        speaker = db.query(Speaker).filter_by(id_speaker=id_speaker).first()
        if not speaker:
            raise NotFoundError(
                "Palestrante não encontrado.", {"id_speaker": id_speaker}
            )

        usuario = db.query(Usuario).filter_by(id_usuario=speaker.id_usuario).first()

        # Atualiza dados do usuário
        if "nome" in data:
            nome = data["nome"].strip()
            if not nome:
                raise ValidationError(
                    "O nome não pode ser vazio.", {"field": "nome"}
                )
            usuario.nome = nome

        if "email" in data:
            email = data["email"].strip().lower()
            if not email:
                raise ValidationError(
                    "O e-mail não pode ser vazio.", {"field": "email"}
                )
            usuario.email = email

        # Atualiza perfil do speaker
        if "bio" in data:
            speaker.bio = data["bio"]

        if "empresa" in data:
            speaker.empresa = data["empresa"]

        db.commit()
        db.refresh(speaker)

        return {
            "success": True,
            "message": "Palestrante atualizado com sucesso!",
            "data": serialize_speaker(speaker),
        }, 200

    except IntegrityError as e:
        db.rollback()
        erro = str(e).lower()
        if "email" in erro or "unique" in erro:
            raise ConflictError(
                "Já existe um usuário com este e-mail.", {"field": "email"}
            )
        raise ConflictError("Erro de integridade ao atualizar palestrante.")

    finally:
        db.close()


def delete_speaker(id_speaker):
    """
    Remove o perfil de speaker e o usuário vinculado.
    Falha se o speaker estiver vinculado a proposals ou sessões.
    """
    db = SessionLocal()
    try:
        speaker = db.query(Speaker).filter_by(id_speaker=id_speaker).first()
        if not speaker:
            raise NotFoundError(
                "Palestrante não encontrado.", {"id_speaker": id_speaker}
            )

        usuario = db.query(Usuario).filter_by(id_usuario=speaker.id_usuario).first()

        # O cascade na relação cuida de apagar o speaker profile
        # Ao apagar o usuário, o speaker é removido em cascata no DB
        db.delete(speaker)
        if usuario:
            db.delete(usuario)

        db.commit()

        return {
            "success": True,
            "message": "Palestrante removido com sucesso!",
            "data": None,
        }, 200

    except IntegrityError as e:
        db.rollback()
        erro = str(e).lower()
        if "foreign key" in erro:
            raise ConflictError(
                "Não é possível excluir este palestrante pois ele está vinculado a propostas ou sessões.",
            )
        raise ConflictError("Erro de integridade ao excluir palestrante.")

    finally:
        db.close()
