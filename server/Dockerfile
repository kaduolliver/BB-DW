# ── Build stage ──────────────────────────────────────────────────────────────
FROM python:3.12-slim AS base

# Evita arquivos .pyc e garante logs imediatos no terminal
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependências do sistema necessárias para psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala dependências Python primeiro (aproveita cache do Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código da aplicação
COPY . .

EXPOSE 6000

CMD ["python", "run.py"]
