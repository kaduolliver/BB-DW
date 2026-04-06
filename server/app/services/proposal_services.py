from app.database.db import SessionLocal
from app.models.proposal import Proposal
from app.utils.validators import validar_campos_obrigatorios

def srv_get_all_proposals():
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
                "id_creator": p.id_creator
            } for p in propostas
        ]
        return resultado, 200
    except Exception as e:
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_create_proposal(data):
    db = SessionLocal()
    try:
        # Título, Trilha e quem criou (id_creator) são obrigatórios
        ok, msg = validar_campos_obrigatorios(data, ['titulo', 'id_track', 'id_creator'])
        if not ok:
            return {"erro": msg}, 400

        nova_proposta = Proposal(
            titulo=data['titulo'],
            descricao=data.get('descricao'),
            nivel=data.get('nivel'),
            formato=data.get('formato'),
            id_track=data['id_track'],
            id_creator=data['id_creator'],
            status='PENDING'  # Toda proposta nasce como pendente
        )

        db.add(nova_proposta)
        db.commit()
        return {"mensagem": "Proposta submetida com sucesso!"}, 201

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_update_proposal(id_proposal, data):
    db = SessionLocal()
    try:
        proposta = db.query(Proposal).filter_by(id_proposal=id_proposal).first()
        if not proposta:
            return {"erro": "Proposta não encontrada."}, 404

        # Permite atualizar textos e trilha (pelo palestrante ou curador)
        if 'titulo' in data:
            proposta.titulo = data['titulo']
        if 'descricao' in data:
            proposta.descricao = data['descricao']
        if 'nivel' in data:
            proposta.nivel = data['nivel']
        if 'formato' in data:
            proposta.formato = data['formato']
        if 'id_track' in data:
            proposta.id_track = data['id_track']

        # Permite ao curador mudar o status de aprovação
        if 'status' in data:
            if data['status'] not in ['PENDING', 'REVIEW', 'APPROVED', 'REJECTED']:
                return {"erro": "Status inválido. Use PENDING, REVIEW, APPROVED ou REJECTED."}, 400
            proposta.status = data['status']

        db.commit()
        return {"mensagem": "Proposta atualizada com sucesso!"}, 200

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_delete_proposal(id_proposal):
    db = SessionLocal()
    try:
        proposta = db.query(Proposal).filter_by(id_proposal=id_proposal).first()
        if not proposta:
            return {"erro": "Proposta não encontrada."}, 404

        db.delete(proposta)
        db.commit()
        return {"mensagem": "Proposta removida com sucesso!"}, 200

    except Exception as e:
        db.rollback()
        # Trava de segurança: impede deletar uma proposta que já virou sessão na agenda
        if "violates foreign key constraint" in str(e).lower() and "session" in str(e).lower():
            return {"erro": "Não é possível excluir esta proposta, pois ela já está agendada na grade final do evento."}, 400
        return {'erro': str(e)}, 500
    finally:
        db.close()