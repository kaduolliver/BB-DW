from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.db import Base

class Track(Base):
    __tablename__ = 'track'
    
    id_track = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    nivel = Column(String(50))
    publico_alvo = Column(String(100))

    proposals = relationship('Proposal', backref='track', lazy=True)
    sessions = relationship('Session', backref='track', lazy=True)