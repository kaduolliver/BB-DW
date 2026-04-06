from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database.db import Base

class Slot(Base):
    __tablename__ = 'slot'
    
    id_slot = Column(Integer, primary_key=True)
    start_time = Column(DateTime, nullable=False, index=True)
    duration_units = Column(Integer, nullable=False)
    id_stage = Column(Integer, ForeignKey('stage.id_stage'), nullable=False)
    tipo = Column(String(50), default='normal')

    __table_args__ = (
        CheckConstraint("duration_units IN (1, 2)", name='check_duration_units'),
        CheckConstraint("tipo IN ('normal', 'keynote', 'keynote_tecnico')", name='check_tipo_slot'),
    )

    sessions = relationship('Session', backref='slot', lazy=True)