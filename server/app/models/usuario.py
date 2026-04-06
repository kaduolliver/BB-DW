from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.db import Base

class Usuario(Base):
    __tablename__ = 'usuario'
    
    id_usuario = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    tentativas_login_falhas = Column(Integer, default=0)
    data_bloqueio = Column(DateTime, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow, server_default=func.current_timestamp())

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'curator', 'speaker')", name='check_role'),
    )


    auditorias = relationship('Auditoria', backref='usuario', lazy=True)
    propostas_criadas = relationship('Proposal', backref='criador', lazy=True)
    speaker_profile = relationship('Speaker', backref='usuario', uselist=False)