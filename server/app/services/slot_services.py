from app.database.db import SessionLocal
from app.models.slot import Slot
from app.utils.validators import validar_campos_obrigatorios
from datetime import datetime

def srv_get_all_slots():
    db = SessionLocal()
    try:
        slots = db.query(Slot).all()
        resultado = [
            {
                "id_slot": s.id_slot,
                "start_time": s.start_time.strftime('%Y-%m-%d %H:%M:%S'),
                "duration_units": s.duration_units,
                "id_stage": s.id_stage,
                "tipo": s.tipo
            } for s in slots
        ]
        return resultado, 200
    except Exception as e:
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_create_slot(data):
    db = SessionLocal()
    try:
        ok, msg = validar_campos_obrigatorios(data, ['start_time', 'duration_units', 'id_stage'])
        if not ok:
            return {"erro": msg}, 400

        # Validação da duração (1 = 25min, 2 = 50min)
        if data['duration_units'] not in [1, 2]:
            return {"erro": "duration_units deve ser 1 (25min) ou 2 (50min)."}, 400

        # Validação do tipo de slot
        tipo_slot = data.get('tipo', 'normal')
        if tipo_slot not in ['normal', 'keynote', 'keynote_tecnico']:
            return {"erro": "O tipo deve ser 'normal', 'keynote' ou 'keynote_tecnico'."}, 400

        novo_slot = Slot(
            start_time=data['start_time'], # O front deve mandar formato 'YYYY-MM-DD HH:MM:SS'
            duration_units=data['duration_units'],
            id_stage=data['id_stage'],
            tipo=tipo_slot
        )

        db.add(novo_slot)
        db.commit()
        return {"mensagem": "Slot de horário criado com sucesso!"}, 201

    except Exception as e:
        db.rollback()
        if "violates foreign key constraint" in str(e).lower() and "stage" in str(e).lower():
            return {"erro": "O id_stage fornecido não existe."}, 400
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_update_slot(id_slot, data):
    db = SessionLocal()
    try:
        slot = db.query(Slot).filter_by(id_slot=id_slot).first()
        if not slot:
            return {"erro": "Slot não encontrado."}, 404

        if 'start_time' in data:
            slot.start_time = data['start_time']
            
        if 'duration_units' in data:
            if data['duration_units'] not in [1, 2]:
                return {"erro": "duration_units deve ser 1 (25min) ou 2 (50min)."}, 400
            slot.duration_units = data['duration_units']
            
        if 'id_stage' in data:
            slot.id_stage = data['id_stage']
            
        if 'tipo' in data:
            if data['tipo'] not in ['normal', 'keynote', 'keynote_tecnico']:
                return {"erro": "O tipo deve ser 'normal', 'keynote' ou 'keynote_tecnico'."}, 400
            slot.tipo = data['tipo']

        db.commit()
        return {"mensagem": "Slot atualizado com sucesso!"}, 200

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_delete_slot(id_slot):
    db = SessionLocal()
    try:
        slot = db.query(Slot).filter_by(id_slot=id_slot).first()
        if not slot:
            return {"erro": "Slot não encontrado."}, 404

        db.delete(slot)
        db.commit()
        return {"mensagem": "Slot removido com sucesso!"}, 200

    except Exception as e:
        db.rollback()
        # Se tentar deletar um slot que já tem uma sessão amarrada
        if "violates foreign key constraint" in str(e).lower() and "session" in str(e).lower():
            return {"erro": "Não é possível excluir este slot pois já existe uma sessão agendada nele."}, 400
        return {'erro': str(e)}, 500
    finally:
        db.close()