import re
from datetime import datetime

def validar_campos_obrigatorios(data, campos):
    faltando = [c for c in campos if not data.get(c)]
    if faltando:
        return False, f"Campos obrigatórios ausentes: {', '.join(faltando)}"
    return True, ""

# def validar_data(data_str):
#     try:
#         return datetime.strptime(data_str, "%Y-%m-%d").date()
#     except ValueError:
#         return None

# def validar_cpf(cpf):
#     return re.fullmatch(r'\d{11}', cpf) is not None
