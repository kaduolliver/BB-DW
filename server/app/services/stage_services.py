from sqlalchemy.exc import IntegrityError
from app.database.db import SessionLocal
from app.exception import ValidationError, NotFoundError, ConflictError
from app.models.stage import Stage
from app.utils.validators import validar_campos_obrigatorios


DURACOES_SLOT_VALIDAS = [25, 50]


def serialize_stage(stage):
    return {
        "id_stage": stage.id_stage,
        "nome": stage.nome,
        "tipo": stage.tipo,
        "capacidade": stage.capacidade,
        "duracao_slot": stage.duracao_slot,
    }


def get_all_stages():
    db = SessionLocal()
    try:
        palcos = db.query(Stage).all()
        resultado = [serialize_stage(palco) for palco in palcos]

        return {
            "success": True,
            "message": "Palcos listados com sucesso.",
            "data": resultado,
        }, 200

    finally:
        db.close()


def create_stage(data):
    db = SessionLocal()
    try:
        ok, msg = validar_campos_obrigatorios(data, ["nome", "duracao_slot"])
        if not ok:
            raise ValidationError(msg)

        nome = data["nome"].strip()
        if not nome:
            raise ValidationError("O nome do palco é obrigatório.", {"field": "nome"})

        duracao_slot = data["duracao_slot"]
        if duracao_slot not in DURACOES_SLOT_VALIDAS:
            raise ValidationError(
                "A duração do slot deve ser 25 ou 50 minutos.",
                {"field": "duracao_slot", "allowed_values": DURACOES_SLOT_VALIDAS},
            )

        novo_palco = Stage(
            nome=nome,
            tipo=data.get("tipo"),
            capacidade=data.get("capacidade"),
            duracao_slot=duracao_slot,
        )

        db.add(novo_palco)
        db.commit()
        db.refresh(novo_palco)

        return {
            "success": True,
            "message": "Palco criado com sucesso!",
            "data": serialize_stage(novo_palco),
        }, 201

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "unique" in erro_db or "duplicate" in erro_db:
            raise ConflictError("Já existe um palco com os dados informados.")

        raise ConflictError("Erro de integridade ao criar palco.")

    finally:
        db.close()


def update_stage(id_stage, data):
    db = SessionLocal()
    try:
        palco = db.query(Stage).filter_by(id_stage=id_stage).first()
        if not palco:
            raise NotFoundError("Palco não encontrado.", {"id_stage": id_stage})

        if "nome" in data:
            nome = data["nome"].strip()
            if not nome:
                raise ValidationError("O nome do palco não pode ser vazio.", {"field": "nome"})
            palco.nome = nome

        if "tipo" in data:
            palco.tipo = data["tipo"]

        if "capacidade" in data:
            palco.capacidade = data["capacidade"]

        if "duracao_slot" in data:
            duracao_slot = data["duracao_slot"]
            if duracao_slot not in DURACOES_SLOT_VALIDAS:
                raise ValidationError(
                    "A duração do slot deve ser 25 ou 50 minutos.",
                    {"field": "duracao_slot", "allowed_values": DURACOES_SLOT_VALIDAS},
                )
            palco.duracao_slot = duracao_slot

        db.commit()
        db.refresh(palco)

        return {
            "success": True,
            "message": "Palco atualizado com sucesso!",
            "data": serialize_stage(palco),
        }, 200

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "unique" in erro_db or "duplicate" in erro_db:
            raise ConflictError("Já existe um palco com os dados informados.")

        raise ConflictError("Erro de integridade ao atualizar palco.")

    finally:
        db.close()


def delete_stage(id_stage):
    db = SessionLocal()
    try:
        palco = db.query(Stage).filter_by(id_stage=id_stage).first()
        if not palco:
            raise NotFoundError("Palco não encontrado.", {"id_stage": id_stage})

        db.delete(palco)
        db.commit()

        return {
            "success": True,
            "message": "Palco removido com sucesso!",
            "data": None,
        }, 200

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "foreign key" in erro_db:
            raise ConflictError(
                "Não é possível excluir um palco que possui sessões ou slots agendados."
            )

        raise ConflictError("Erro de integridade ao excluir palco.")

    finally:
        db.close()