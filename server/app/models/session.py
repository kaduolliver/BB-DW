from sqlalchemy import Column, Integer, ForeignKey
from app.database.db import Base

class Session(Base):
    __tablename__ = 'session'
    
    id_session = Column(Integer, primary_key=True)
    id_proposal = Column(Integer, ForeignKey('proposal.id_proposal'), unique=True)
    id_slot = Column(Integer, ForeignKey('slot.id_slot'), nullable=False, index=True)
    id_stage = Column(Integer, ForeignKey('stage.id_stage'), nullable=False, index=True)
    id_track = Column(Integer, ForeignKey('track.id_track'), nullable=False)