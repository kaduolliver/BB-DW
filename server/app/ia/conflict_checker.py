"""
HU 3.1 — Verificação de conflitos SEM IA (lógica pura).

Expõe duas funções:
- check_speaker_conflict(id_speaker, id_slot): verifica se o palestrante já
  está em outra sessão que ocorre no mesmo slot de tempo.
- check_keynote_block(id_slot): verifica se há um keynote bloqueando todo o
  auditório no horário do slot informado, de forma antecipada (antes de tentar
  inserir no banco).
"""

from app.database.db import SessionLocal
from app.models.session import Session
from app.models.slot import Slot
from app.models.associations import session_speaker


# --------------------------------------------------------------------------- #
#  Helpers internos                                                            #
# --------------------------------------------------------------------------- #

def _get_slot(db, id_slot):
    """Retorna o Slot ou None."""
    return db.query(Slot).filter_by(id_slot=id_slot).first()


def _slots_sobrepostos(db, id_slot):
    """
    Retorna todos os ids de slots que têm o mesmo start_time do slot informado
    (i.e., ocorrem em paralelo). Inclui o próprio id_slot.
    """
    slot = _get_slot(db, id_slot)
    if not slot:
        return []

    slots_paralelos = (
        db.query(Slot.id_slot)
        .filter(Slot.start_time == slot.start_time)
        .all()
    )
    return [s.id_slot for s in slots_paralelos]


# --------------------------------------------------------------------------- #
#  Funções públicas                                                            #
# --------------------------------------------------------------------------- #

def check_speaker_conflict(id_speaker: int, id_slot: int) -> dict:
    """
    Verifica se o palestrante (id_speaker) já possui outra sessão agendada
    em um slot que ocorre no mesmo horário de início que id_slot.

    Retorna:
        {
            "has_conflict": bool,
            "conflicting_sessions": [{ "id_session": int, "id_slot": int }],
            "message": str
        }
    """
    db = SessionLocal()
    try:
        ids_paralelos = _slots_sobrepostos(db, id_slot)
        if not ids_paralelos:
            return {
                "has_conflict": False,
                "conflicting_sessions": [],
                "message": "Slot não encontrado.",
            }

        # Busca sessões no mesmo horário que tenham este palestrante
        sessoes_conflito = (
            db.query(Session)
            .join(session_speaker, session_speaker.c.id_session == Session.id_session)
            .filter(
                session_speaker.c.id_speaker == id_speaker,
                Session.id_slot.in_(ids_paralelos),
                Session.id_slot != id_slot,  # exclui o próprio slot alvo
            )
            .all()
        )

        conflitos = [
            {"id_session": s.id_session, "id_slot": s.id_slot}
            for s in sessoes_conflito
        ]

        if conflitos:
            return {
                "has_conflict": True,
                "conflicting_sessions": conflitos,
                "message": (
                    f"Conflito detectado: o palestrante já está em "
                    f"{len(conflitos)} sessão(ões) no mesmo horário."
                ),
            }

        return {
            "has_conflict": False,
            "conflicting_sessions": [],
            "message": "Palestrante disponível para este horário.",
        }

    finally:
        db.close()


def check_keynote_block(id_slot: int) -> dict:
    """
    Verifica se existe um keynote ativo no mesmo horário do slot informado,
    o que bloquearia todos os auditórios (Master e Planalto).

    Retorna:
        {
            "is_blocked": bool,
            "blocking_slot": { "id_slot": int, "tipo": str, "start_time": str } | None,
            "message": str
        }
    """
    db = SessionLocal()
    try:
        slot_alvo = _get_slot(db, id_slot)
        if not slot_alvo:
            return {
                "is_blocked": False,
                "blocking_slot": None,
                "message": "Slot não encontrado.",
            }

        keynote_bloqueio = (
            db.query(Slot)
            .filter(
                Slot.start_time == slot_alvo.start_time,
                Slot.tipo.in_(["keynote", "keynote_tecnico"]),
                Slot.id_slot != id_slot,
            )
            .first()
        )

        if keynote_bloqueio:
            return {
                "is_blocked": True,
                "blocking_slot": {
                    "id_slot": keynote_bloqueio.id_slot,
                    "tipo": keynote_bloqueio.tipo,
                    "start_time": keynote_bloqueio.start_time.isoformat(),
                },
                "message": (
                    f"Bloqueio ativo: existe um {keynote_bloqueio.tipo} "
                    f"neste horário que bloqueia todos os auditórios."
                ),
            }

        return {
            "is_blocked": False,
            "blocking_slot": None,
            "message": "Nenhum keynote bloqueando este horário.",
        }

    finally:
        db.close()
