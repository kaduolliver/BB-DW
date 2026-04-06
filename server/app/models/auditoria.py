from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.db import Base

class Auditoria(Base):
    __tablename__ = 'auditoria'
    
    id_auditoria = Column(Integer, primary_key=True)
    id_usuario = Column(Integer, ForeignKey('usuario.id_usuario'))
    acao = Column(String(100))
    detalhes = Column(Text)
    data_hora = Column(DateTime, default=datetime.utcnow, server_default=func.current_timestamp())