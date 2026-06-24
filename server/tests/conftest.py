import os
import pytest
from testcontainers.postgres import PostgresContainer

# Start Postgres container globally before any test modules are imported
postgres = PostgresContainer("postgres:15-alpine")
postgres.start()

# Set environment variables so db.py picks up the correct DATABASE_URL
os.environ["DATABASE_URL"] = postgres.get_connection_url()
os.environ["JWT_SECRET_KEY"] = "super-secret-test-key"
os.environ["SECRET_KEY"] = "super-secret-test-key"
os.environ["FLASK_ENV"] = "testing"
os.environ["FLASK_DEBUG"] = "true"

def pytest_sessionfinish(session, exitstatus):
    postgres.stop()

@pytest.fixture(scope="session")
def app():
    from app import create_app
    flask_app = create_app()
    flask_app.config.update({"TESTING": True})
    with flask_app.app_context():
        yield flask_app

@pytest.fixture(scope="session")
def client(app):
    return app.test_client()

@pytest.fixture(scope="function")
def init_database(app):
    import psycopg2
    import os
    
    db_url = os.environ["DATABASE_URL"].replace("+psycopg2", "")
    
    # Executar o dump SQL cru para criar tabelas e triggers/funções (como fn_auditoria)
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    with conn.cursor() as cur:
        # Lê o arquivo SQL principal do projeto
        sql_path = os.path.join(os.path.dirname(__file__), "..", "app", "database", "BB DW PostgreSQL.sql")
        with open(sql_path, "r", encoding="utf-8") as f:
            cur.execute(f.read())
            
        # Cria tabela de alertas se não existir no dump SQL
        cur.execute("""
            CREATE TABLE IF NOT EXISTS ia_alert (
                id_alert SERIAL PRIMARY KEY,
                id_session_a INT,
                id_session_b INT,
                motivo TEXT,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
    conn.close()

    yield

    # Teardown: dropar todas as tabelas (limpar o banco para o próximo teste)
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    conn.close()

@pytest.fixture(scope="function")
def db_session(init_database):
    from app.database.db import SessionLocal
    session = SessionLocal()
    yield session
    session.close()
