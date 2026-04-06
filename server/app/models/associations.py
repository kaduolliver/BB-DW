from sqlalchemy import Column, Integer, ForeignKey, Table
from app.database.db import Base

proposal_speaker = Table('proposal_speaker', Base.metadata,
    Column('id_proposal', Integer, ForeignKey('proposal.id_proposal'), primary_key=True),
    Column('id_speaker', Integer, ForeignKey('speaker.id_speaker'), primary_key=True)
)

session_speaker = Table('session_speaker', Base.metadata,
    Column('id_session', Integer, ForeignKey('session.id_session'), primary_key=True),
    Column('id_speaker', Integer, ForeignKey('speaker.id_speaker'), primary_key=True)
)