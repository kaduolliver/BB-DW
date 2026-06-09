from app.database.db import SessionLocal
from app.models.ia_alert import IAAlert
from app.models.session import Session
from app.models.slot import Slot
from app.ia.similarity_service import scan_concurrent_sessions
from app.ia.conflict_checker import check_speaker_conflict

def get_all_alerts():
    db = SessionLocal()
    try:
        alertas = db.query(IAAlert).all()
        dados = []
        for a in alertas:
            dados.append({
                "id": a.id_alert,
                "tipo": a.tipo,
                "titulo": a.titulo,
                "conflito": a.conflito,
                "descricao": a.descricao,
                "percentual": a.percentual,
                "sessoes": a.sessoes
            })
        return {"success": True, "data": {"alerts": dados}}, 200
    except Exception as e:
        return {"success": False, "message": str(e)}, 500
    finally:
        db.close()


def scan_and_save_all_alerts():
    db = SessionLocal()
    try:
        # 1. Limpa tabela atual
        db.query(IAAlert).delete()
        db.commit()

        novos_alertas = []

        # 2. Escaneia conflitos de Similaridade (todas as propostas contra todas)
        from app.ia.similarity_service import scan_all_proposals
        res, status = scan_all_proposals()
        if status != 200:
            return {"success": False, "message": res.get("message", "Erro na IA")}, status
            
        if status == 200 and res.get("data") and res["data"].get("alerts"):
            for alert in res["data"]["alerts"]:
                perc = round(alert.get("score", 0) * 100)
                ia_alert = IAAlert(
                    tipo="similaridade",
                    titulo=f"Similaridade {perc}%",
                    conflito="Sobreposição de Tema",
                    descricao=alert.get("reasoning", "Detectado pela IA"),
                    percentual=perc,
                    sessoes=[alert["id_proposal_a"], alert["id_proposal_b"]]
                )
                novos_alertas.append(ia_alert)

        # 3. Escaneia conflitos Tecnicos (Palestrante duplicado no mesmo horario)
        # Importante: a relacao e N:M mas vamos simplificar pegando da tabela session_speaker.
        # Ou podemos iterar todos os palestrantes.
        # check_speaker_conflict(id_speaker, id_slot)
        # Vamos iterar por sessões
        from app.models.associations import session_speaker
        sessoes_spk = db.execute(session_speaker.select()).fetchall()
        # sessoes_spk é lista de tuplas (id_session, id_speaker)
        # Agrupar palestrante -> [(id_session, id_slot), ...]
        
        # Para cada session_speaker, chamamos check_speaker_conflict passando o speaker e o slot atual
        # Mas check_speaker_conflict retorna todas as sessoes em paralelo para o mesmo speaker.
        
        # Uma abordagem mais otimizada:
        speakers_checked = set()
        for row in sessoes_spk:
            id_session = row[0]  # c.id_session
            id_speaker = row[1]  # c.id_speaker
            
            # Pega o slot da session atual
            sess = db.query(Session).filter_by(id_session=id_session).first()
            if not sess: continue

            # Evita checar o mesmo speaker no mesmo slot varias vezes
            if (id_speaker, sess.id_slot) in speakers_checked:
                continue
            speakers_checked.add((id_speaker, sess.id_slot))

            res = check_speaker_conflict(id_speaker, sess.id_slot)
            if res.get("has_conflict"):
                # As sessões conflitantes + a sessão atual
                conflitantes = [s["id_session"] for s in res["conflicting_sessions"]]
                sessoes_envolvidas = list(set([id_session] + conflitantes))
                
                # Mapear para id_proposal para o frontend exibir corretamente o nome
                propostas_ids = []
                for s_id in sessoes_envolvidas:
                    sess_obj = db.query(Session).filter_by(id_session=s_id).first()
                    if sess_obj:
                        propostas_ids.append(sess_obj.id_proposal)
                
                tech_alert = IAAlert(
                    tipo="tecnico",
                    titulo="Conflito de Palestrante",
                    conflito="Choque de Horários",
                    descricao=res.get("message", "Palestrante alocado em sessões paralelas."),
                    percentual=None,
                    sessoes=list(set(propostas_ids))
                )
                novos_alertas.append(tech_alert)

        if novos_alertas:
            db.add_all(novos_alertas)
            db.commit()

        return {"success": True, "message": f"{len(novos_alertas)} alertas gerados e salvos."}, 200

    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}, 500
    finally:
        db.close()
