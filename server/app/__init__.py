import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

# Importando apenas os Blueprints que usamos agora no Sistema de Eventos
from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp
from app.routes.stage_routes import stage_bp
from app.routes.session_routes import session_bp
from app.routes.track_routes import track_bp
from app.routes.proposal_routes import proposal_bp
from app.routes.slot_routes import slot_bp

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.secret_key = os.getenv("SECRET_KEY", "chave_fallback_insegura") 
    
    app.config['DEBUG'] = True

    # CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
    CORS(app, supports_credentials=True)

    # Registrando as rotas
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(stage_bp)
    app.register_blueprint(session_bp)
    app.register_blueprint(track_bp)
    app.register_blueprint(proposal_bp)
    app.register_blueprint(slot_bp)

    return app