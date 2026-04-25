"""
HU 3.2 — Detecção de sobreposição temática via LLM local (Ollama).

Expõe duas funções principais:
- compare_sessions(id_session_a, id_session_b): compara duas sessões pelo
  título e descrição das propostas associadas, retornando score e reasoning.
- scan_concurrent_sessions(id_slot): escaneia todos os pares de sessões em
  um mesmo slot e lista os que ultrapassam o threshold de similaridade.

Requisito de ambiente:
  - Ollama rodando em http://localhost:11434
  - Modelo configurado via variável OLLAMA_MODEL (padrão: llama3)
"""

import os
import json
import itertools
import requests

from app.database.db import SessionLocal
from app.models.session import Session
from app.models.proposal import Proposal
from app.models.slot import Slot


# --------------------------------------------------------------------------- #
#  Configuração                                                               #
# --------------------------------------------------------------------------- #

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.70"))
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "60"))  # segundos


# --------------------------------------------------------------------------- #
#  Prompt                                                                     #
# --------------------------------------------------------------------------- #

PROMPT_TEMPLATE = """Você é um especialista em curadoria de eventos técnicos.

Analise as duas sessões abaixo e determine o grau de sobreposição temática \
entre elas (de 0.0 a 1.0), onde:
- 0.0 = temas completamente diferentes, sem risco de concorrência de público
- 1.0 = temas idênticos ou extremamente similares

Sessão A:
Título: {titulo_a}
Descrição: {descricao_a}

Sessão B:
Título: {titulo_b}
Descrição: {descricao_b}

Responda APENAS com um JSON válido, sem markdown, sem explicação extra:
{{"score": <número entre 0.0 e 1.0>, "reasoning": "<explicação curta em pt-BR>"}}"""


# --------------------------------------------------------------------------- #
#  Helpers internos                                                           #
# --------------------------------------------------------------------------- #

def _get_session_with_proposal(db, id_session: int):
    """Retorna (Session, Proposal) ou (None, None)."""
    sessao = db.query(Session).filter_by(id_session=id_session).first()
    if not sessao:
        return None, None
    proposta = db.query(Proposal).filter_by(id_proposal=sessao.id_proposal).first()
    return sessao, proposta


def _call_ollama(prompt: str) -> dict:
    """
    Chama o Ollama com o prompt e retorna o JSON parseado da resposta.
    Raises: requests.RequestException, json.JSONDecodeError, KeyError
    """
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json",
    }
    response = requests.post(OLLAMA_URL, json=payload, timeout=OLLAMA_TIMEOUT)
    response.raise_for_status()

    raw = response.json().get("response", "")
    # Garante que só parseia o JSON retornado pelo modelo
    parsed = json.loads(raw)
    return parsed


def _build_result(score: float, reasoning: str, session_a_id: int, session_b_id: int) -> dict:
    alert = score >= SIMILARITY_THRESHOLD
    return {
        "id_session_a": session_a_id,
        "id_session_b": session_b_id,
        "score": round(score, 4),
        "reasoning": reasoning,
        "alert": alert,
        "threshold": SIMILARITY_THRESHOLD,
    }


# --------------------------------------------------------------------------- #
#  Funções públicas                                                           #
# --------------------------------------------------------------------------- #

def compare_sessions(id_session_a: int, id_session_b: int) -> tuple[dict, int]:
    """
    Compara duas sessões semanticamente via LLM local.

    Retorna:
        (resultado_dict, http_status_code)

    resultado_dict:
        {
            "success": bool,
            "data": {
                "id_session_a": int,
                "id_session_b": int,
                "score": float,       # 0.0 – 1.0
                "reasoning": str,
                "alert": bool,        # True se score >= threshold
                "threshold": float,
            },
            "message": str
        }
    """
    if id_session_a == id_session_b:
        return {
            "success": False,
            "data": None,
            "message": "As duas sessões devem ser diferentes.",
        }, 400

    db = SessionLocal()
    try:
        sessao_a, proposta_a = _get_session_with_proposal(db, id_session_a)
        sessao_b, proposta_b = _get_session_with_proposal(db, id_session_b)

        if not sessao_a or not proposta_a:
            return {
                "success": False,
                "data": None,
                "message": f"Sessão {id_session_a} não encontrada ou sem proposta vinculada.",
            }, 404

        if not sessao_b or not proposta_b:
            return {
                "success": False,
                "data": None,
                "message": f"Sessão {id_session_b} não encontrada ou sem proposta vinculada.",
            }, 404

        prompt = PROMPT_TEMPLATE.format(
            titulo_a=proposta_a.titulo or "(sem título)",
            descricao_a=proposta_a.descricao or "(sem descrição)",
            titulo_b=proposta_b.titulo or "(sem título)",
            descricao_b=proposta_b.descricao or "(sem descrição)",
        )

        try:
            llm_result = _call_ollama(prompt)
            score = float(llm_result.get("score", 0.0))
            reasoning = str(llm_result.get("reasoning", ""))
        except requests.exceptions.ConnectionError:
            return {
                "success": False,
                "data": None,
                "message": (
                    "Não foi possível conectar ao Ollama. "
                    "Verifique se o servidor está rodando em "
                    f"{OLLAMA_URL.replace('/api/generate', '')}."
                ),
            }, 503
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "data": None,
                "message": f"O modelo demorou mais de {OLLAMA_TIMEOUT}s para responder. Tente novamente.",
            }, 504
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            return {
                "success": False,
                "data": None,
                "message": f"Resposta inesperada do modelo LLM: {str(e)}",
            }, 502

        resultado = _build_result(score, reasoning, id_session_a, id_session_b)

        return {
            "success": True,
            "data": resultado,
            "message": (
                "⚠️ Sobreposição temática detectada!" if resultado["alert"]
                else "✅ Temas suficientemente distintos."
            ),
        }, 200

    finally:
        db.close()


def scan_concurrent_sessions(id_slot: int) -> tuple[dict, int]:
    """
    Escaneia todos os pares de sessões agendadas em slots com o mesmo
    start_time que id_slot e retorna aqueles com sobreposição temática.

    Retorna:
        (resultado_dict, http_status_code)

    resultado_dict:
        {
            "success": bool,
            "data": {
                "id_slot": int,
                "total_pairs_checked": int,
                "alerts": [ { ...compare_result... } ],
                "model": str,
                "threshold": float,
            },
            "message": str
        }
    """
    db = SessionLocal()
    try:
        slot_alvo = db.query(Slot).filter_by(id_slot=id_slot).first()
        if not slot_alvo:
            return {
                "success": False,
                "data": None,
                "message": f"Slot {id_slot} não encontrado.",
            }, 404

        # Todos os slots no mesmo horário
        ids_paralelos = [
            s.id_slot
            for s in db.query(Slot.id_slot)
            .filter(Slot.start_time == slot_alvo.start_time)
            .all()
        ]

        # Sessões nesses slots
        sessoes = (
            db.query(Session)
            .filter(Session.id_slot.in_(ids_paralelos))
            .all()
        )

        if len(sessoes) < 2:
            return {
                "success": True,
                "data": {
                    "id_slot": id_slot,
                    "total_pairs_checked": 0,
                    "alerts": [],
                    "model": OLLAMA_MODEL,
                    "threshold": SIMILARITY_THRESHOLD,
                },
                "message": "Menos de 2 sessões simultâneas — nada a comparar.",
            }, 200

    finally:
        db.close()

    # Gera todos os pares únicos e compara
    pares = list(itertools.combinations([s.id_session for s in sessoes], 2))
    alertas = []

    for id_a, id_b in pares:
        result, status = compare_sessions(id_a, id_b)
        if status != 200:
            # Erro na chamada LLM — propaga o primeiro erro encontrado
            return result, status
        if result["data"]["alert"]:
            alertas.append(result["data"])

    return {
        "success": True,
        "data": {
            "id_slot": id_slot,
            "total_pairs_checked": len(pares),
            "alerts": alertas,
            "model": OLLAMA_MODEL,
            "threshold": SIMILARITY_THRESHOLD,
        },
        "message": (
            f"⚠️ {len(alertas)} par(es) com sobreposição temática detectado(s)!"
            if alertas
            else f"✅ Nenhuma sobreposição temática entre as {len(sessoes)} sessões simultâneas."
        ),
    }, 200
