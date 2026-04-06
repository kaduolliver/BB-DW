from flask import session
from app.database.db import SessionLocal
from app.models.usuario import Usuario
from app.models.speaker import Speaker
from sqlalchemy.exc import IntegrityError

def get_perfil_usuario():
    """Retorna os dados do usuário e, se for palestrante, os dados de speaker."""
    if 'id_usuario' not in session:
        return {'erro': 'Usuário não autenticado.'}, 401

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter_by(id_usuario=session['id_usuario']).first()
        if not usuario:
            return {'erro': 'Usuário não encontrado.'}, 404

        dados_perfil = {
            'nome': usuario.nome,
            'email': usuario.email,
            'role': usuario.role,
            'criado_em': usuario.criado_em.strftime('%Y-%m-%d %H:%M:%S') if usuario.criado_em else None
        }

        # Se for palestrante, busca a bio e empresa
        if usuario.role == 'speaker' and usuario.speaker_profile:
            dados_perfil['bio'] = usuario.speaker_profile.bio
            dados_perfil['empresa'] = usuario.speaker_profile.empresa

        return dados_perfil, 200

    except Exception as e:
        return {'erro': str(e)}, 500
    finally:
        db.close()


def atualizar_usuario(data):
    """Atualiza dados básicos do usuário (nome, email)."""
    if 'id_usuario' not in session:
        return {'erro': 'Usuário não autenticado.'}, 401

    nome = data.get('nome')
    email = data.get('email')

    if not nome and not email:
        return {'erro': 'Nenhum dado fornecido para atualização.'}, 400

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter_by(id_usuario=session['id_usuario']).first()
        if not usuario:
            return {'erro': 'Usuário não encontrado.'}, 404

        if nome:
            usuario.nome = nome
        if email:
            usuario.email = email

        db.commit()
        return {'mensagem': 'Perfil atualizado com sucesso.'}, 200

    except IntegrityError:
        db.rollback()
        return {'erro': 'Este e-mail já está em uso por outro usuário.'}, 400
    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()


def atualizar_perfil_speaker(data):
    """Atualiza dados específicos do palestrante (bio, empresa)."""
    if 'id_usuario' not in session:
        return {'erro': 'Usuário não autenticado.'}, 401

    # Verifica se a role na sessão (ou no banco) é realmente de palestrante
    if session.get('role') != 'speaker':
        return {'erro': 'Apenas palestrantes podem acessar esta função.'}, 403

    bio = data.get('bio')
    empresa = data.get('empresa')

    db = SessionLocal()
    try:
        # Busca o perfil de speaker amarrado a este id_usuario
        speaker = db.query(Speaker).filter_by(id_usuario=session['id_usuario']).first()
        
        # Se por algum motivo o registro de speaker não existir, cria um
        if not speaker:
            speaker = Speaker(id_usuario=session['id_usuario'])
            db.add(speaker)

        # Atualiza os campos que foram enviados
        if bio is not None:
            speaker.bio = bio
        if empresa is not None:
            speaker.empresa = empresa

        db.commit()
        return {'mensagem': 'Perfil de palestrante atualizado com sucesso.'}, 200

    except Exception as e:
        db.rollback()
        return {'erro': str(e)}, 500
    finally:
        db.close()