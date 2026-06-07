from app.database.db import engine, Base
from app.models.usuario import Usuario
from app.models.speaker import Speaker
from app.models.track import Track
from app.models.stage import Stage
from app.models.slot import Slot
from app.models.proposal import Proposal
from app.models.session import Session
from app.models.auditoria import Auditoria

print("Criando tabelas no banco de dados...")
Base.metadata.create_all(bind=engine)
print("Tabelas criadas com sucesso!")
