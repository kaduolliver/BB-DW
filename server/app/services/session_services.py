from app.database.db import SessionLocal
from app.models.session import Session
from app.models.slot import Slot
from app.utils.validators import validar_campos_obrigatorios
from sqlalchemy.exc import InternalError, IntegrityError

def srv_get_all_sessions():
    db = SessionLocal()
    try:
        # Aqui, numa versão avançada, podemos fazer JOINs para trazer o nome do palco, trilha e palestrante
        sessoes = db.query(Session).all()
        resultado = [
            {
                "id_session": s.id_session,
                "id_proposal": s.id_proposal,
                "id_slot": s.id_slot,
                "id_stage": s.id_stage,
                "id_track": s.id_track
            } for s in sessoes
        ]
        return resultado, 200
    except Exception as e:
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_create_session(data):
    db = SessionLocal()
    try:
        ok, msg = validar_campos_obrigatorios(data, ['id_proposal', 'id_slot', 'id_stage', 'id_track'])
        if not ok:
            return {"erro": msg}, 400

        nova_sessao = Session(
            id_proposal=data['id_proposal'],
            id_slot=data['id_slot'],
            id_stage=data['id_stage'],
            id_track=data['id_track']
        )

        db.add(nova_sessao)
        db.commit() # É neste momento que o PostgreSQL valida as Triggers de conflito!
        
        return {"mensagem": "Sessão agendada com sucesso na grelha!"}, 201

    except InternalError as e:
        db.rollback()
        erro_db = str(e.orig)
        
        # Captura os erros das Triggers que criámos no SQL
        if "Conflito: palco já ocupado" in erro_db:
            return {"erro": "Conflito de horário: Este palco já tem uma atividade agendada para este horário."}, 409
        
        if "Keynote bloqueia" in erro_db:
            return {"erro": "Bloqueio de Keynote: Não é possível agendar atividades neste palco agora, pois um Keynote está a bloquear todo o auditório neste horário."}, 409
            
        return {"erro": f"Erro nas regras de negócio do evento: {erro_db}"}, 400

    except IntegrityError as e:
        db.rollback()
        erro_db = str(e.orig)
        if "unique" in erro_db.lower() and "id_proposal" in erro_db.lower():
            return {"erro": "Esta proposta já foi agendada noutro palco ou horário."}, 409
        
        return {"erro": "Erro de integridade referencial. Verifique se o palco, slot e proposta existem."}, 400

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_delete_session(id_session):
    db = SessionLocal()
    try:
        sessao = db.query(Session).filter_by(id_session=id_session).first()
        if not sessao:
            return {"erro": "Sessão não encontrada na grelha."}, 404

        db.delete(sessao)
        db.commit()
        return {"mensagem": "Sessão removida da grelha com sucesso!"}, 200

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()