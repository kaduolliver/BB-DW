from sqlalchemy import Column, Integer, String, CheckConstraint
from sqlalchemy.orm import relationship
from app.database.db import Base

class Stage(Base):
    __tablename__ = 'stage'
    
    id_stage = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    tipo = Column(String(50))
    capacidade = Column(Integer)
    duracao_slot = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint("duracao_slot IN (25, 50)", name='check_duracao_slot'),
    )

    slots = relationship('Slot', backref='stage', lazy=True)
    sessions = relationship('Session', backref='stage', lazy=True)