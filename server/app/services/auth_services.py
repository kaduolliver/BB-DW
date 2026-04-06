from app.database.db import SessionLocal
from app.models.usuario import Usuario
from app.models.speaker import Speaker
from app.models.auditoria import Auditoria
from app.utils.security import hash_senha, verificar_senha
from app.utils.validators import validar_campos_obrigatorios
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
from flask import session
from sqlalchemy import text

MAX_TENTATIVAS_LOGIN = 3
TEMPO_BLOQUEIO_MINUTOS = 5

def registrar_usuario(data):
    db = SessionLocal()
    try:
        obrigatorios = ['nome', 'email', 'senha', 'role']
        ok, msg = validar_campos_obrigatorios(data, obrigatorios)
        if not ok:
            return {"erro": msg}, 400

        nome = data['nome']
        email = data['email']
        senha = data['senha']
        role = data['role']

        if role not in ['admin', 'curator', 'speaker']:
            return {"erro": "Role de usuário inválida. Use admin, curator ou speaker."}, 400

        senha_hash = hash_senha(senha)

        novo_usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=senha_hash,
            role=role
        )

        db.add(novo_usuario)
        db.flush() # Pega o ID gerado sem fazer commit final

        # Se for palestrante, já cria o perfil vazio atrelado a ele
        if role == 'speaker':
            novo_speaker = Speaker(id_usuario=novo_usuario.id_usuario)
            db.add(novo_speaker)

        db.commit()
        return {"mensagem": "Usuário registrado com sucesso!"}, 201

    except IntegrityError as e:
        db.rollback()
        if "email" in str(e).lower() or "unique" in str(e).lower():
            return {"erro": "E-mail já registrado."}, 400
        return {"erro": "Erro de integridade do banco de dados."}, 500
    except Exception as e:
        db.rollback()
        return {"erro": str(e)}, 500
    finally:
        db.close()


def login_usuario(data):
    db = SessionLocal()
    try:
        obrigatorios = ['email', 'senha']
        ok, msg = validar_campos_obrigatorios(data, obrigatorios)
        if not ok:
            return {'erro': msg}, 400

        usuario = db.query(Usuario).filter_by(email=data['email']).first()

        if not usuario:
            # Pode registrar a falha na auditoria (usando a function do PostgreSQL)
            db.execute(text("SELECT fn_auditoria(NULL, 'FALHA_LOGIN', 'Tentativa para email não cadastrado');"))
            db.commit()
            return {'erro': 'E-mail ou senha inválidos.'}, 401

        # Verifica bloqueio de conta
        if usuario.data_bloqueio:
            if datetime.now() < (usuario.data_bloqueio + timedelta(minutes=TEMPO_BLOQUEIO_MINUTOS)):
                return {'erro': f'Sua conta está bloqueada. Tente novamente em alguns minutos.'}, 403
            else:
                # Tempo expirou, desbloqueia o usuário
                usuario.tentativas_login_falhas = 0
                usuario.data_bloqueio = None
                db.commit()

        # Verifica senha
        if not verificar_senha(data['senha'], usuario.senha_hash):
            usuario.tentativas_login_falhas += 1
            
            if usuario.tentativas_login_falhas >= MAX_TENTATIVAS_LOGIN:
                usuario.data_bloqueio = datetime.now()
                db.execute(text("SELECT fn_auditoria(:id, 'CONTA_BLOQUEADA', 'Bloqueio por excesso de tentativas');"), {"id": usuario.id_usuario})
                db.commit()
                return {'erro': 'Muitas tentativas falhas. Conta bloqueada temporariamente.'}, 401
            
            db.commit()
            return {'erro': 'E-mail ou senha inválidos.'}, 401

        # Login bem sucedido: reseta falhas
        usuario.tentativas_login_falhas = 0
        usuario.data_bloqueio = None

        # Registra auditoria de sucesso
        db.execute(text("SELECT fn_auditoria(:id, 'LOGIN_SUCESSO', 'Usuário fez login');"), {"id": usuario.id_usuario})
        db.commit()

        # Configura a Sessão do Flask (ou gera um token JWT, caso prefira)
        session['id_usuario'] = usuario.id_usuario
        session['role'] = usuario.role

        # Se for palestrante, pode ser útil colocar o id_speaker na sessão
        id_speaker = None
        if usuario.role == 'speaker' and usuario.speaker_profile:
            id_speaker = usuario.speaker_profile.id_speaker
            session['id_speaker'] = id_speaker

        return {
            'mensagem': 'Login realizado com sucesso!',
            'usuario': {
                'id_usuario': usuario.id_usuario,
                'nome': usuario.nome,
                'email': usuario.email,
                'role': usuario.role,
                'id_speaker': id_speaker
            }
        }, 200

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()


def logout_usuario():
    db = SessionLocal()
    try:
        user_id = session.get('id_usuario')
        if not user_id:
            return {'erro': 'Nenhum usuário logado na sessão.'}, 400

        # Registra logout na auditoria
        db.execute(text("SELECT fn_auditoria(:id, 'LOGOUT', 'Usuário saiu do sistema');"), {"id": user_id})
        db.commit()

        session.clear() 
        return {'mensagem': 'Logout realizado com sucesso.'}, 200

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()


def verificar_sessao():
    if 'id_usuario' not in session:
        return {'autenticado': False}, 401

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter_by(id_usuario=session['id_usuario']).first()

        if not usuario:
            session.clear()
            return {'erro': 'Usuário não encontrado'}, 404

        return {
            'autenticado': True,
            'usuario': {
                'id_usuario': usuario.id_usuario,
                'nome': usuario.nome,
                'email': usuario.email,
                'role': usuario.role
            }
        }, 200
    finally:
        db.close()