from app.database.db import SessionLocal
from app.models.stage import Stage # Certifique-se de que o model existe conforme criamos lá atrás
from app.utils.validators import validar_campos_obrigatorios

def srv_get_all_stages():
    db = SessionLocal()
    try:
        palcos = db.query(Stage).all()
        resultado = [
            {
                "id_stage": p.id_stage,
                "nome": p.nome,
                "tipo": p.tipo,
                "capacidade": p.capacidade,
                "duracao_slot": p.duracao_slot
            } for p in palcos
        ]
        return resultado, 200
    except Exception as e:
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_create_stage(data):
    db = SessionLocal()
    try:
        ok, msg = validar_campos_obrigatorios(data, ['nome', 'duracao_slot'])
        if not ok:
            return {"erro": msg}, 400

        if data['duracao_slot'] not in [25, 50]:
            return {"erro": "A duração do slot deve ser 25 ou 50 minutos."}, 400

        novo_palco = Stage(
            nome=data['nome'],
            tipo=data.get('tipo'),
            capacidade=data.get('capacidade'),
            duracao_slot=data['duracao_slot']
        )

        db.add(novo_palco)
        db.commit()
        return {"mensagem": "Palco criado com sucesso!"}, 201

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_update_stage(id_stage, data):
    db = SessionLocal()
    try:
        palco = db.query(Stage).filter_by(id_stage=id_stage).first()
        if not palco:
            return {"erro": "Palco não encontrado."}, 404

        if 'nome' in data:
            palco.nome = data['nome']
        if 'tipo' in data:
            palco.tipo = data['tipo']
        if 'capacidade' in data:
            palco.capacidade = data['capacidade']
        if 'duracao_slot' in data:
            if data['duracao_slot'] not in [25, 50]:
                return {"erro": "A duração do slot deve ser 25 ou 50 minutos."}, 400
            palco.duracao_slot = data['duracao_slot']

        db.commit()
        return {"mensagem": "Palco atualizado com sucesso!"}, 200

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_delete_stage(id_stage):
    db = SessionLocal()
    try:
        palco = db.query(Stage).filter_by(id_stage=id_stage).first()
        if not palco:
            return {"erro": "Palco não encontrado."}, 404

        db.delete(palco)
        db.commit()
        return {"mensagem": "Palco removido com sucesso!"}, 200

    except Exception as e:
        db.rollback()
        # Caso tente deletar um palco que já tem sessões/slots vinculados
        if "violates foreign key constraint" in str(e).lower():
            return {"erro": "Não é possível excluir um palco que possui sessões ou slots agendados."}, 400
        return {'erro': str(e)}, 500
    finally:
        db.close()