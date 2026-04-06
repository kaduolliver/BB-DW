from sqlalchemy import Column, Integer, String, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database.db import Base

class Proposal(Base):
    __tablename__ = 'proposal'
    
    id_proposal = Column(Integer, primary_key=True)
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text)
    status = Column(String(50), default='PENDING')
    nivel = Column(String(50))
    formato = Column(String(50))
    id_track = Column(Integer, ForeignKey('track.id_track'))
    id_creator = Column(Integer, ForeignKey('usuario.id_usuario'))

    __table_args__ = (
        CheckConstraint("status IN ('PENDING', 'REVIEW', 'APPROVED', 'REJECTED')", name='check_status_proposal'),
    )

    session_of_proposal = relationship('Session', backref='proposal_ref', uselist=False)