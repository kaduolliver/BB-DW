from sqlalchemy.exc import IntegrityError
from app.database.db import SessionLocal
from app.exception import ValidationError, NotFoundError, ConflictError
from app.models.proposal import Proposal
from app.utils.validators import validar_campos_obrigatorios


STATUS_VALIDOS = ["PENDING", "REVIEW", "APPROVED", "REJECTED"]


def get_all_proposals():
    db = SessionLocal()
    try:
        propostas = db.query(Proposal).all()

        resultado = [
            {
                "id_proposal": p.id_proposal,
                "titulo": p.titulo,
                "descricao": p.descricao,
                "status": p.status,
                "nivel": p.nivel,
                "formato": p.formato,
                "id_track": p.id_track,
                "id_creator": p.id_creator,
            }
            for p in propostas
        ]

        return {
            "success": True,
            "message": "Propostas listadas com sucesso.",
            "data": resultado,
        }, 200

    finally:
        db.close()


def create_proposal(data):
    db = SessionLocal()
    try:
        ok, msg = validar_campos_obrigatorios(data, ["titulo", "id_track", "id_creator"])
        if not ok:
            raise ValidationError(msg)

        titulo = data["titulo"].strip()
        if not titulo:
            raise ValidationError("O título da proposta é obrigatório.", {"field": "titulo"})

        nova_proposta = Proposal(
            titulo=titulo,
            descricao=data.get("descricao"),
            nivel=data.get("nivel"),
            formato=data.get("formato"),
            id_track=data["id_track"],
            id_creator=data["id_creator"],
            status="PENDING",
        )

        db.add(nova_proposta)
        db.commit()
        db.refresh(nova_proposta)

        return {
            "success": True,
            "message": "Proposta submetida com sucesso!",
            "data": {
                "id_proposal": nova_proposta.id_proposal,
                "titulo": nova_proposta.titulo,
                "descricao": nova_proposta.descricao,
                "status": nova_proposta.status,
                "nivel": nova_proposta.nivel,
                "formato": nova_proposta.formato,
                "id_track": nova_proposta.id_track,
                "id_creator": nova_proposta.id_creator,
            },
        }, 201

    except IntegrityError as e:
        db.rollback()
        mensagem_erro = str(e).lower()

        if "foreign key" in mensagem_erro:
            raise ConflictError(
                "Não foi possível criar a proposta porque a trilha ou o usuário informado não existe."
            )

        raise ConflictError("Erro de integridade ao criar proposta.")

    finally:
        db.close()


def update_proposal(id_proposal, data):
    db = SessionLocal()
    try:
        proposta = db.query(Proposal).filter_by(id_proposal=id_proposal).first()
        if not proposta:
            raise NotFoundError("Proposta não encontrada.", {"id_proposal": id_proposal})

        if "titulo" in data:
            titulo = data["titulo"].strip()
            if not titulo:
                raise ValidationError("O título da proposta não pode ser vazio.", {"field": "titulo"})
            proposta.titulo = titulo

        if "descricao" in data:
            proposta.descricao = data["descricao"]

        if "nivel" in data:
            proposta.nivel = data["nivel"]

        if "formato" in data:
            proposta.formato = data["formato"]

        if "id_track" in data:
            proposta.id_track = data["id_track"]

        if "status" in data:
            status = data["status"]
            if status not in STATUS_VALIDOS:
                raise ValidationError(
                    "Status inválido. Use PENDING, REVIEW, APPROVED ou REJECTED.",
                    {"field": "status", "allowed_values": STATUS_VALIDOS},
                )
            proposta.status = status

        db.commit()
        db.refresh(proposta)

        return {
            "success": True,
            "message": "Proposta atualizada com sucesso!",
            "data": {
                "id_proposal": proposta.id_proposal,
                "titulo": proposta.titulo,
                "descricao": proposta.descricao,
                "status": proposta.status,
                "nivel": proposta.nivel,
                "formato": proposta.formato,
                "id_track": proposta.id_track,
                "id_creator": proposta.id_creator,
            },
        }, 200

    except IntegrityError as e:
        db.rollback()
        mensagem_erro = str(e).lower()

        if "foreign key" in mensagem_erro:
            raise ConflictError("A trilha informada não existe.")

        raise ConflictError("Erro de integridade ao atualizar proposta.")

    finally:
        db.close()


def delete_proposal(id_proposal):
    db = SessionLocal()
    try:
        proposta = db.query(Proposal).filter_by(id_proposal=id_proposal).first()
        if not proposta:
            raise NotFoundError("Proposta não encontrada.", {"id_proposal": id_proposal})

        db.delete(proposta)
        db.commit()

        return {
            "success": True,
            "message": "Proposta removida com sucesso!",
            "data": None,
        }, 200

    except IntegrityError as e:
        db.rollback()
        mensagem_erro = str(e).lower()

        if "foreign key" in mensagem_erro and "session" in mensagem_erro:
            raise ConflictError(
                "Não é possível excluir esta proposta, pois ela já está agendada na grade final do evento."
            )

        raise ConflictError("Erro de integridade ao excluir proposta.")

    finally:
        db.close()