from app.database.db import SessionLocal
from app.models.usuario import Usuario
from app.models.track import Track
from app.models.stage import Stage
from app.models.slot import Slot
from app.models.speaker import Speaker
from app.models.proposal import Proposal
from app.models.session import Session
from app.models.ia_alert import IAAlert
import bcrypt
from datetime import datetime, timedelta

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed():
    db = SessionLocal()

    # Verifica se já existem trilhas para não duplicar
    if db.query(Track).first():
        print("Banco já contém dados, abortando seed para evitar duplicatas.")
        return

    print("Iniciando seed do banco de dados...")

    # 1. Usuários
    admin = Usuario(nome="Admin BBDW", email="admin@bbdw.com", senha_hash=hash_password("admin123"), role="admin")
    curador = Usuario(nome="Curador Tech", email="curador@bbdw.com", senha_hash=hash_password("curador123"), role="curator")
    palestrante_user1 = Usuario(nome="João Silva", email="joao@speaker.com", senha_hash=hash_password("senha123"), role="speaker")
    palestrante_user2 = Usuario(nome="Maria Souza", email="maria@speaker.com", senha_hash=hash_password("senha123"), role="speaker")
    
    db.add_all([admin, curador, palestrante_user1, palestrante_user2])
    db.flush()

    # 2. Palestrantes
    speaker1 = Speaker(id_usuario=palestrante_user1.id_usuario, bio="Especialista em IA.", empresa="TechCorp")
    speaker2 = Speaker(id_usuario=palestrante_user2.id_usuario, bio="Desenvolvedora Backend Sênior.", empresa="CodeSolutions")
    
    db.add_all([speaker1, speaker2])
    db.flush()

    # 3. Trilhas
    track_ia = Track(nome="Inteligência Artificial", descricao="Avanços em IA e Machine Learning", nivel="Avançado", publico_alvo="Cientistas de Dados")
    track_backend = Track(nome="Backend", descricao="Arquitetura de software e APIs", nivel="Intermediário", publico_alvo="Desenvolvedores")
    track_security = Track(nome="Segurança", descricao="Cybersecurity e Defesa", nivel="Básico", publico_alvo="Público Geral")
    
    db.add_all([track_ia, track_backend, track_security])
    db.flush()

    # 4. Palcos
    stage_verde = Stage(nome="Planalto Verde", tipo="planalto", capacidade=300, duracao_slot=25)
    stage_master = Stage(nome="Master Azul", tipo="master", capacidade=500, duracao_slot=50)
    
    db.add_all([stage_verde, stage_master])
    db.flush()

    # 5. Slots (Horários)
    now = datetime.now()
    slot1 = Slot(start_time=now + timedelta(days=1), duration_units=1, id_stage=stage_verde.id_stage, tipo="normal")
    slot2 = Slot(start_time=now + timedelta(days=1, hours=1), duration_units=2, id_stage=stage_master.id_stage, tipo="keynote")
    
    db.add_all([slot1, slot2])
    db.flush()

    # 6. Propostas
    prop1 = Proposal(titulo="O Futuro das LLMs", descricao="Discussão sobre modelos de linguagem...", status="APPROVED", nivel="Avançado", formato="Palestra", id_track=track_ia.id_track, id_creator=palestrante_user1.id_usuario)
    prop2 = Proposal(titulo="Microsserviços em Python", descricao="Boas práticas com FastAPI e Flask.", status="APPROVED", nivel="Intermediário", formato="Workshop", id_track=track_backend.id_track, id_creator=palestrante_user2.id_usuario)
    prop3 = Proposal(titulo="Proposta Pendente de Segurança", descricao="Ainda sob análise.", status="PENDING", nivel="Básico", formato="Palestra", id_track=track_security.id_track, id_creator=palestrante_user1.id_usuario)
    
    # Associa palestrantes às propostas
    prop1.speakers_associados.append(speaker1)
    prop2.speakers_associados.append(speaker2)
    
    db.add_all([prop1, prop2, prop3])
    db.flush()

    # 7. Sessões (Grade - Propostas alocadas em Slots)
    sessao1 = Session(id_proposal=prop1.id_proposal, id_slot=slot1.id_slot, id_stage=stage_verde.id_stage, id_track=track_ia.id_track)
    sessao2 = Session(id_proposal=prop2.id_proposal, id_slot=slot2.id_slot, id_stage=stage_master.id_stage, id_track=track_backend.id_track)
    
    # Associa palestrantes às sessões
    sessao1.speakers_da_sessao.append(speaker1)
    sessao2.speakers_da_sessao.append(speaker2)

    db.add_all([sessao1, sessao2])
    db.flush()

    # 8. Alertas de IA
    alerta1 = IAAlert(
        tipo="similaridade",
        titulo="Possível Palestra Duplicada",
        conflito="Tópico de IA abordado em múltiplas propostas semelhantes",
        descricao="A IA detectou 85% de similaridade entre duas propostas da trilha de Inteligência Artificial.",
        percentual=85.0,
        sessoes=[sessao1.id_session]
    )
    db.add(alerta1)
    
    db.commit()
    db.close()
    print("Seed concluído com sucesso!")

if __name__ == "__main__":
    seed()
