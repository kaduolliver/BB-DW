import bcrypt
import random
import string

def gerar_otp():
    return ''.join(random.choices(string.digits, k=6))

def hash_senha(senha):
    return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()

def verificar_senha(senha, senha_hash):
    return bcrypt.checkpw(senha.encode(), senha_hash.encode())
