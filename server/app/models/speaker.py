from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.db import Base

from app.models.associations import proposal_speaker, session_speaker

class Speaker(Base):
    __tablename__ = 'speaker'
    
    id_speaker = Column(Integer, primary_key=True)
    id_usuario = Column(Integer, ForeignKey('usuario.id_usuario'), unique=True)
    bio = Column(Text)
    empresa = Column(String(255))

    proposals = relationship('Proposal', secondary=proposal_speaker, backref='speakers_associados', lazy='dynamic')
    sessions = relationship('Session', secondary=session_speaker, backref='speakers_da_sessao', lazy='dynamic')