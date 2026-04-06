from sqlalchemy.exc import IntegrityError

from app.database.db import SessionLocal
from app.exception import ValidationError, NotFoundError, ConflictError
from app.models.track import Track
from app.utils.validators import validar_campos_obrigatorios


def serialize_track(track):
    return {
        "id_track": track.id_track,
        "nome": track.nome,
        "descricao": track.descricao,
        "nivel": track.nivel,
        "publico_alvo": track.publico_alvo,
    }


def get_all_tracks():
    db = SessionLocal()
    try:
        trilhas = db.query(Track).all()
        resultado = [serialize_track(trilha) for trilha in trilhas]

        return {
            "success": True,
            "message": "Trilhas listadas com sucesso.",
            "data": resultado,
        }, 200

    finally:
        db.close()


def create_track(data):
    db = SessionLocal()
    try:
        ok, msg = validar_campos_obrigatorios(data, ["nome"])
        if not ok:
            raise ValidationError(msg)

        nome = data["nome"].strip()
        if not nome:
            raise ValidationError("O nome da trilha é obrigatório.", {"field": "nome"})

        nova_trilha = Track(
            nome=nome,
            descricao=data.get("descricao"),
            nivel=data.get("nivel"),
            publico_alvo=data.get("publico_alvo"),
        )

        db.add(nova_trilha)
        db.commit()
        db.refresh(nova_trilha)

        return {
            "success": True,
            "message": "Trilha criada com sucesso!",
            "data": serialize_track(nova_trilha),
        }, 201

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "unique" in erro_db or "duplicate" in erro_db:
            raise ConflictError("Já existe uma trilha com os dados informados.")

        raise ConflictError("Erro de integridade ao criar trilha.")

    finally:
        db.close()


def update_track(id_track, data):
    db = SessionLocal()
    try:
        trilha = db.query(Track).filter_by(id_track=id_track).first()
        if not trilha:
            raise NotFoundError("Trilha não encontrada.", {"id_track": id_track})

        if "nome" in data:
            nome = data["nome"].strip()
            if not nome:
                raise ValidationError("O nome da trilha não pode ser vazio.", {"field": "nome"})
            trilha.nome = nome

        if "descricao" in data:
            trilha.descricao = data["descricao"]

        if "nivel" in data:
            trilha.nivel = data["nivel"]

        if "publico_alvo" in data:
            trilha.publico_alvo = data["publico_alvo"]

        db.commit()
        db.refresh(trilha)

        return {
            "success": True,
            "message": "Trilha atualizada com sucesso!",
            "data": serialize_track(trilha),
        }, 200

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "unique" in erro_db or "duplicate" in erro_db:
            raise ConflictError("Já existe uma trilha com os dados informados.")

        raise ConflictError("Erro de integridade ao atualizar trilha.")

    finally:
        db.close()


def delete_track(id_track):
    db = SessionLocal()
    try:
        trilha = db.query(Track).filter_by(id_track=id_track).first()
        if not trilha:
            raise NotFoundError("Trilha não encontrada.", {"id_track": id_track})

        db.delete(trilha)
        db.commit()

        return {
            "success": True,
            "message": "Trilha removida com sucesso!",
            "data": None,
        }, 200

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "foreign key" in erro_db:
            raise ConflictError(
                "Não é possível excluir uma trilha que já possui propostas ou sessões vinculadas."
            )

        raise ConflictError("Erro de integridade ao excluir trilha.")

    finally:
        db.close()