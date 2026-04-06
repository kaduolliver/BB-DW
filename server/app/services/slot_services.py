from sqlalchemy.exc import IntegrityError
from app.database.db import SessionLocal
from app.exception import ValidationError, NotFoundError, ConflictError
from app.models.slot import Slot
from app.utils.validators import validar_campos_obrigatorios


DURATION_UNITS_VALIDOS = [1, 2]
TIPOS_SLOT_VALIDOS = ["normal", "keynote", "keynote_tecnico"]


def serialize_slot(slot):
    return {
        "id_slot": slot.id_slot,
        "start_time": slot.start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "duration_units": slot.duration_units,
        "id_stage": slot.id_stage,
        "tipo": slot.tipo,
    }


def get_all_slots():
    db = SessionLocal()
    try:
        slots = db.query(Slot).all()
        resultado = [serialize_slot(slot) for slot in slots]

        return {
            "success": True,
            "message": "Slots listados com sucesso.",
            "data": resultado,
        }, 200

    finally:
        db.close()


def create_slot(data):
    db = SessionLocal()
    try:
        ok, msg = validar_campos_obrigatorios(
            data,
            ["start_time", "duration_units", "id_stage"],
        )
        if not ok:
            raise ValidationError(msg)

        duration_units = data["duration_units"]
        if duration_units not in DURATION_UNITS_VALIDOS:
            raise ValidationError(
                "duration_units deve ser 1 (25min) ou 2 (50min).",
                {"field": "duration_units", "allowed_values": DURATION_UNITS_VALIDOS},
            )

        tipo_slot = data.get("tipo", "normal")
        if tipo_slot not in TIPOS_SLOT_VALIDOS:
            raise ValidationError(
                "O tipo deve ser 'normal', 'keynote' ou 'keynote_tecnico'.",
                {"field": "tipo", "allowed_values": TIPOS_SLOT_VALIDOS},
            )

        novo_slot = Slot(
            start_time=data["start_time"],
            duration_units=duration_units,
            id_stage=data["id_stage"],
            tipo=tipo_slot,
        )

        db.add(novo_slot)
        db.commit()
        db.refresh(novo_slot)

        return {
            "success": True,
            "message": "Slot de horário criado com sucesso!",
            "data": serialize_slot(novo_slot),
        }, 201

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "foreign key" in erro_db and "stage" in erro_db:
            raise ConflictError("O id_stage fornecido não existe.")

        raise ConflictError("Erro de integridade ao criar slot.")

    finally:
        db.close()


def update_slot(id_slot, data):
    db = SessionLocal()
    try:
        slot = db.query(Slot).filter_by(id_slot=id_slot).first()
        if not slot:
            raise NotFoundError("Slot não encontrado.", {"id_slot": id_slot})

        if "start_time" in data:
            slot.start_time = data["start_time"]

        if "duration_units" in data:
            duration_units = data["duration_units"]
            if duration_units not in DURATION_UNITS_VALIDOS:
                raise ValidationError(
                    "duration_units deve ser 1 (25min) ou 2 (50min).",
                    {"field": "duration_units", "allowed_values": DURATION_UNITS_VALIDOS},
                )
            slot.duration_units = duration_units

        if "id_stage" in data:
            slot.id_stage = data["id_stage"]

        if "tipo" in data:
            tipo = data["tipo"]
            if tipo not in TIPOS_SLOT_VALIDOS:
                raise ValidationError(
                    "O tipo deve ser 'normal', 'keynote' ou 'keynote_tecnico'.",
                    {"field": "tipo", "allowed_values": TIPOS_SLOT_VALIDOS},
                )
            slot.tipo = tipo

        db.commit()
        db.refresh(slot)

        return {
            "success": True,
            "message": "Slot atualizado com sucesso!",
            "data": serialize_slot(slot),
        }, 200

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "foreign key" in erro_db and "stage" in erro_db:
            raise ConflictError("O id_stage fornecido não existe.")

        raise ConflictError("Erro de integridade ao atualizar slot.")

    finally:
        db.close()


def delete_slot(id_slot):
    db = SessionLocal()
    try:
        slot = db.query(Slot).filter_by(id_slot=id_slot).first()
        if not slot:
            raise NotFoundError("Slot não encontrado.", {"id_slot": id_slot})

        db.delete(slot)
        db.commit()

        return {
            "success": True,
            "message": "Slot removido com sucesso!",
            "data": None,
        }, 200

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig).lower()

        if "foreign key" in erro_db and "session" in erro_db:
            raise ConflictError(
                "Não é possível excluir este slot, pois já existe uma sessão agendada nele."
            )

        raise ConflictError("Erro de integridade ao excluir slot.")

    finally:
        db.close()