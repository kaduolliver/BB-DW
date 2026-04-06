from flask import Blueprint, request, jsonify
from app.controllers.auth_controller import (
    registrar_usuario,
    login_usuario,
    verificar_sessao,
    logout_usuario,
)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    resposta, status = registrar_usuario(request.json)
    return jsonify(resposta), status


@auth_bp.post("/login")
def login():
    resposta, status = login_usuario(request.json)
    return jsonify(resposta), status


@auth_bp.get("/session")
def session_route():
    resposta, status = verificar_sessao()
    return jsonify(resposta), status


@auth_bp.post("/logout")
def logout():
    resposta, status = logout_usuario()
    return jsonify(resposta), status