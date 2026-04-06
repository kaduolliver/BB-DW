from app.database.db import SessionLocal
from app.models.track import Track
from app.utils.validators import validar_campos_obrigatorios

def srv_get_all_tracks():
    db = SessionLocal()
    try:
        trilhas = db.query(Track).all()
        resultado = [
            {
                "id_track": t.id_track,
                "nome": t.nome,
                "descricao": t.descricao,
                "nivel": t.nivel,
                "publico_alvo": t.publico_alvo
            } for t in trilhas
        ]
        return resultado, 200
    except Exception as e:
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_create_track(data):
    db = SessionLocal()
    try:
        # Apenas 'nome' é estritamente obrigatório segundo o SQL, mas podemos validar outros se quiser
        ok, msg = validar_campos_obrigatorios(data, ['nome'])
        if not ok:
            return {"erro": msg}, 400

        nova_trilha = Track(
            nome=data['nome'],
            descricao=data.get('descricao'),
            nivel=data.get('nivel'),
            publico_alvo=data.get('publico_alvo')
        )

        db.add(nova_trilha)
        db.commit()
        return {"mensagem": "Trilha criada com sucesso!"}, 201

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_update_track(id_track, data):
    db = SessionLocal()
    try:
        trilha = db.query(Track).filter_by(id_track=id_track).first()
        if not trilha:
            return {"erro": "Trilha não encontrada."}, 404

        if 'nome' in data:
            trilha.nome = data['nome']
        if 'descricao' in data:
            trilha.descricao = data['descricao']
        if 'nivel' in data:
            trilha.nivel = data['nivel']
        if 'publico_alvo' in data:
            trilha.publico_alvo = data['publico_alvo']

        db.commit()
        return {"mensagem": "Trilha atualizada com sucesso!"}, 200

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()

def srv_delete_track(id_track):
    db = SessionLocal()
    try:
        trilha = db.query(Track).filter_by(id_track=id_track).first()
        if not trilha:
            return {"erro": "Trilha não encontrada."}, 404

        db.delete(trilha)
        db.commit()
        return {"mensagem": "Trilha removida com sucesso!"}, 200

    except Exception as e:
        db.rollback()
        # Tratamento caso a trilha já tenha propostas ou sessões vinculadas
        if "violates foreign key constraint" in str(e).lower():
            return {"erro": "Não é possível excluir uma trilha que já possui propostas ou sessões vinculadas."}, 400
        return {'erro': str(e)}, 500
    finally:
        db.close()