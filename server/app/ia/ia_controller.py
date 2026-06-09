"""
Controller IA — camada fina entre routes e services.
Delega para conflict_checker (HU 3.1) e similarity_service (HU 3.2).
"""

from app.ia.conflict_checker import check_speaker_conflict, check_keynote_block
from app.ia.similarity_service import compare_sessions, scan_concurrent_sessions


# ── HU 3.1 ──────────────────────────────────────────────────────────────────

def ctrl_speaker_conflict(id_speaker: int, id_slot: int):
    resultado = check_speaker_conflict(id_speaker, id_slot)
    status = 409 if resultado.get("has_conflict") else 200
    return {"success": True, "data": resultado}, status


def ctrl_keynote_block(id_slot: int):
    resultado = check_keynote_block(id_slot)
    status = 409 if resultado.get("is_blocked") else 200
    return {"success": True, "data": resultado}, status


# ── HU 3.2 ──────────────────────────────────────────────────────────────────

def ctrl_compare_sessions(id_session_a: int, id_session_b: int):
    return compare_sessions(id_session_a, id_session_b)


def ctrl_scan_slot(id_slot: int):
    return scan_concurrent_sessions(id_slot)


# ── HU 3.3 ──────────────────────────────────────────────────────────────────

from app.ia.alert_service import get_all_alerts, scan_and_save_all_alerts

def ctrl_get_alerts():
    return get_all_alerts()

def ctrl_scan_all_alerts():
    return scan_and_save_all_alerts()
