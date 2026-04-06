-- =========================
-- USUÁRIOS
-- =========================
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'curator', 'speaker')),
    
    tentativas_login_falhas INTEGER DEFAULT 0,
    data_bloqueio TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- AUDITORIA
-- =========================
CREATE TABLE auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_usuario INT,
    acao VARCHAR(100),
    detalhes TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- =========================
-- TRILHAS
-- =========================
CREATE TABLE track (
    id_track SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    nivel VARCHAR(50),
    publico_alvo VARCHAR(100)
);

-- =========================
-- PALCOS
-- =========================
CREATE TABLE stage (
    id_stage SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50), -- Planalto, Master, etc
    capacidade INT,
    duracao_slot INT NOT NULL CHECK (duracao_slot IN (25, 50))
);

-- =========================
-- SLOTS (BASE TEMPORAL)
-- =========================
CREATE TABLE slot (
    id_slot SERIAL PRIMARY KEY,
    start_time TIMESTAMP NOT NULL,
    duration_units INT NOT NULL CHECK (duration_units IN (1,2)), -- 25 ou 50 min
    id_stage INT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'normal' CHECK (tipo IN ('normal', 'keynote', 'keynote_tecnico')),
    
    FOREIGN KEY (id_stage) REFERENCES stage(id_stage)
);

-- =========================
-- PALESTRANTES
-- =========================
CREATE TABLE speaker (
    id_speaker SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE,
    bio TEXT,
    empresa VARCHAR(255),

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- =========================
-- PROPOSTAS
-- =========================
CREATE TABLE proposal (
    id_proposal SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'REVIEW', 'APPROVED', 'REJECTED')),
    
    nivel VARCHAR(50),
    formato VARCHAR(50),
    
    id_track INT,
    id_creator INT,

    FOREIGN KEY (id_track) REFERENCES track(id_track),
    FOREIGN KEY (id_creator) REFERENCES usuario(id_usuario)
);

-- =========================
-- RELAÇÃO PROPOSTA ↔ SPEAKER
-- =========================
CREATE TABLE proposal_speaker (
    id_proposal INT,
    id_speaker INT,
    
    PRIMARY KEY (id_proposal, id_speaker),
    FOREIGN KEY (id_proposal) REFERENCES proposal(id_proposal),
    FOREIGN KEY (id_speaker) REFERENCES speaker(id_speaker)
);

-- =========================
-- SESSÕES (AGENDA FINAL)
-- =========================
CREATE TABLE session (
    id_session SERIAL PRIMARY KEY,
    id_proposal INT UNIQUE,
    id_slot INT NOT NULL,
    id_stage INT NOT NULL,
    id_track INT NOT NULL,

    FOREIGN KEY (id_proposal) REFERENCES proposal(id_proposal),
    FOREIGN KEY (id_slot) REFERENCES slot(id_slot),
    FOREIGN KEY (id_stage) REFERENCES stage(id_stage),
    FOREIGN KEY (id_track) REFERENCES track(id_track)
);

-- =========================
-- RELAÇÃO SESSÃO ↔ SPEAKER
-- =========================
CREATE TABLE session_speaker (
    id_session INT,
    id_speaker INT,
    
    PRIMARY KEY (id_session, id_speaker),
    FOREIGN KEY (id_session) REFERENCES session(id_session),
    FOREIGN KEY (id_speaker) REFERENCES speaker(id_speaker)
);

-- =========================
-- ÍNDICES
-- =========================
CREATE INDEX idx_slot_time ON slot(start_time);
CREATE INDEX idx_session_stage ON session(id_stage);
CREATE INDEX idx_session_slot ON session(id_slot);

-- =========================
-- FUNÇÃO DE AUDITORIA
-- =========================
CREATE OR REPLACE FUNCTION fn_auditoria(
    p_usuario INT,
    p_acao TEXT,
    p_detalhes TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO auditoria (id_usuario, acao, detalhes)
    VALUES (p_usuario, p_acao, p_detalhes);
END;
$$ LANGUAGE plpgsql;

-- =========================
-- TRIGGER: EVITAR CONFLITO DE PALCO
-- =========================
CREATE OR REPLACE FUNCTION fn_evitar_conflito_stage()
RETURNS TRIGGER AS $$
DECLARE
    v_start TIMESTAMP;
BEGIN
    SELECT start_time INTO v_start
    FROM slot WHERE id_slot = NEW.id_slot;

    IF EXISTS (
        SELECT 1
        FROM session s
        JOIN slot sl ON s.id_slot = sl.id_slot
        WHERE s.id_stage = NEW.id_stage
        AND sl.start_time = v_start
    ) THEN
        RAISE EXCEPTION 'Conflito: palco já ocupado nesse horário';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_conflito_stage
BEFORE INSERT ON session
FOR EACH ROW
EXECUTE FUNCTION fn_evitar_conflito_stage();

-- =========================
-- TRIGGER: KEYNOTE BLOQUEIA AUDITÓRIO
-- =========================
CREATE OR REPLACE FUNCTION fn_keynote_bloqueio()
RETURNS TRIGGER AS $$
DECLARE
    v_tipo TEXT;
BEGIN
    SELECT tipo INTO v_tipo FROM slot WHERE id_slot = NEW.id_slot;

    IF v_tipo IN ('keynote', 'keynote_tecnico') THEN
        IF EXISTS (
            SELECT 1 FROM session s
            WHERE s.id_slot = NEW.id_slot
        ) THEN
            RAISE EXCEPTION 'Keynote bloqueia todos os palcos neste horário';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_keynote
BEFORE INSERT ON session
FOR EACH ROW
EXECUTE FUNCTION fn_keynote_bloqueio();

-- =========================
-- DADOS INICIAIS
-- =========================

-- Admin
-- INSERT INTO usuario (nome, email, senha_hash, role)
-- VALUES ('Admin BBDW', 'admin@bbdw.com', 'hash123', 'admin');

-- Trilhas
-- INSERT INTO track (nome) VALUES
-- ('Inteligência Artificial'),
-- ('Backend'),
-- ('Segurança');

-- Palcos
-- INSERT INTO stage (nome, tipo, capacidade, duracao_slot) VALUES
-- ('Planalto Verde', 'planalto', 300, 25),
-- ('Planalto Branco', 'planalto', 300, 25),
-- ('Master Azul', 'master', 500, 25),
-- ('Sala 1', 'sala', 100, 50);

-- Slots exemplo
-- INSERT INTO slot (start_time, duration_units, id_stage)
-- VALUES
-- ('2026-10-20 10:00:00', 1, 1),
-- ('2026-10-20 10:00:00', 1, 2),
-- ('2026-10-20 10:00:00', 1, 3),
-- ('2026-10-20 10:00:00', 2, 4);