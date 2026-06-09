from sqlalchemy import Column, Integer, String, Float, JSON
from app.database.db import Base

class IAAlert(Base):
    __tablename__ = "ia_alerts"

    id_alert = Column(Integer, primary_key=True, autoincrement=True)
    tipo = Column(String(50), nullable=False) # 'similaridade' ou 'tecnico'
    titulo = Column(String(200), nullable=False)
    conflito = Column(String(200), nullable=False)
    descricao = Column(String, nullable=False)
    percentual = Column(Float, nullable=True) # opcional, preenchido para IA
    sessoes = Column(JSON, nullable=False) # Lista de id_session
