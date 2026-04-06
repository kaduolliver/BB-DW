import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp
from app.routes.stage_routes import stage_bp
from app.routes.session_routes import session_bp
from app.routes.track_routes import track_bp
from app.routes.proposal_routes import proposal_bp
from app.routes.slot_routes import slot_bp
from app.error_handlers import register_error_handlers


def create_app():
    load_dotenv()

    app = Flask(__name__)

    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise RuntimeError("SECRET_KEY não configurada no ambiente.")

    app.config["SECRET_KEY"] = secret_key
    app.config["DEBUG"] = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS(
        app,
        supports_credentials=True,
        origins=[frontend_url]
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(stage_bp)
    app.register_blueprint(session_bp)
    app.register_blueprint(track_bp)
    app.register_blueprint(proposal_bp)
    app.register_blueprint(slot_bp)

    register_error_handlers(app)

    @app.get("/api/health")
    def health_check():
        return {"success": True, "message": "API online"}, 200

    return app