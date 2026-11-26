from pathlib import Path
import sys

# Ensure `python3 app/main.py` works directly as well as `python3 -m app.main`.
if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from flask import Flask, jsonify, request

from app.services.contact_service import ContactService
from app.services.trek_service import TrekService
from app.utils.config import Settings, get_settings


def create_app(settings: Settings | None = None) -> Flask:
    """Create and configure the TrekExplorer Flask application."""
    cfg = settings or get_settings()
    app = Flask(__name__)
    contact_service = ContactService(cfg.contact_store_path)
    trek_service = TrekService()

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = cfg.allowed_origins
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
        return response

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "trekexplorer-backend"})

    @app.route("/api/contact", methods=["GET", "POST", "OPTIONS"])
    def contact_collection():
        if request.method == "OPTIONS":
            return ("", 204)
        if request.method == "GET":
            return jsonify(contact_service.list_messages())

        payload = request.get_json(silent=True) or {}
        try:
            created = contact_service.create_message(payload)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        return jsonify(created), 201

    @app.route("/api/contact/<int:message_id>", methods=["DELETE", "OPTIONS"])
    def contact_item(message_id: int):
        if request.method == "OPTIONS":
            return ("", 204)
        if not contact_service.delete_message(message_id):
            return jsonify({"error": "Message not found"}), 404
        return ("", 204)

    @app.get("/api/treks")
    def treks_list():
        category = request.args.get("category")
        return jsonify(trek_service.list_treks(category=category))

    @app.get("/api/treks/<trek_id>")
    def trek_detail(trek_id: str):
        trek = trek_service.get_trek(trek_id)
        if trek is None:
            return jsonify({"error": "Trek not found"}), 404
        return jsonify(trek)

    return app


app = create_app()

if __name__ == "__main__":
    cfg = get_settings()
    app.run(host=cfg.host, port=cfg.port, debug=cfg.debug)
