import logging
from flask import jsonify
from werkzeug.exceptions import HTTPException
from server.app.exception import AppError

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    @app.errorhandler(AppError)
    def handle_app_error(error):
        response = {
            "success": False,
            "error": {
                "code": error.error_code,
                "message": error.message,
                "details": error.details
            }
        }
        return jsonify(response), error.status_code

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        response = {
            "success": False,
            "error": {
                "code": error.name.lower().replace(" ", "_"),
                "message": error.description,
                "details": {}
            }
        }
        return jsonify(response), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        logger.exception("Erro inesperado na aplicação: %s", error)

        response = {
            "success": False,
            "error": {
                "code": "internal_server_error",
                "message": "Ocorreu um erro interno no servidor.",
                "details": {}
            }
        }
        return jsonify(response), 500