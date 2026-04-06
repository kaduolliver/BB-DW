from sqlalchemy.exc import InternalError, IntegrityError
from app.database.db import SessionLocal
from app.exception import ValidationError, NotFoundError, ConflictError
from app.models.session import Session
from app.utils.validators import validar_campos_obrigatorios


def serialize_session(sessao):
    return {
        "id_session": sessao.id_session,
        "id_proposal": sessao.id_proposal,
        "id_slot": sessao.id_slot,
        "id_stage": sessao.id_stage,
        "id_track": sessao.id_track,
    }


def get_all_sessions():
    db = SessionLocal()
    try:
        sessoes = db.query(Session).all()

        resultado = [serialize_session(sessao) for sessao in sessoes]

        return {
            "success": True,
            "message": "Sessões listadas com sucesso.",
            "data": resultado,
        }, 200

    finally:
        db.close()


def create_session(data):
    db = SessionLocal()
    try:
        ok, msg = validar_campos_obrigatorios(
            data,
            ["id_proposal", "id_slot", "id_stage", "id_track"],
        )
        if not ok:
            raise ValidationError(msg)

        nova_sessao = Session(
            id_proposal=data["id_proposal"],
            id_slot=data["id_slot"],
            id_stage=data["id_stage"],
            id_track=data["id_track"],
        )

        db.add(nova_sessao)
        db.commit()
        db.refresh(nova_sessao)

        return {
            "success": True,
            "message": "Sessão agendada com sucesso na grelha!",
            "data": serialize_session(nova_sessao),
        }, 201

    except InternalError as e:
        db.rollback()
        erro_db = str(e.orig)

        if "Conflito: palco já ocupado" in erro_db:
            raise ConflictError(
                "Conflito de horário: este palco já tem uma atividade agendada para este horário."
            )

        if "Keynote bloqueia" in erro_db:
            raise ConflictError(
                "Bloqueio de Keynote: não é possível agendar atividades neste palco agora, pois um keynote está a bloquear todo o auditório neste horário."
            )

        raise ValidationError(
            "Erro nas regras de negócio do evento.",
            {"database_error": erro_db},
        )

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "unique" in erro_db and "id_proposal" in erro_db:
            raise ConflictError("Esta proposta já foi agendada noutro palco ou horário.")

        if "foreign key" in erro_db:
            raise ConflictError(
                "Erro de integridade referencial. Verifique se o palco, slot, trilha e proposta existem."
            )

        raise ConflictError("Erro de integridade ao agendar sessão.")

    finally:
        db.close()


def delete_session(id_session):
    db = SessionLocal()
    try:
        sessao = db.query(Session).filter_by(id_session=id_session).first()
        if not sessao:
            raise NotFoundError(
                "Sessão não encontrada na grelha.",
                {"id_session": id_session},
            )

        db.delete(sessao)
        db.commit()

        return {
            "success": True,
            "message": "Sessão removida da grelha com sucesso!",
            "data": None,
        }, 200

    finally:
        db.close()