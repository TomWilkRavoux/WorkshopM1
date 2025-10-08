import importlib
import types
import os

# Essaie d'importer l'appli depuis backend/app.py (adapter si besoin)
# On accepte soit une variable "app", soit une factory "create_app()".
def _get_app():
    mod = importlib.import_module("backend.app")  # change le chemin si nécessaire
    if isinstance(getattr(mod, "app", None), types.ModuleType):
        return mod.app
    if getattr(mod, "app", None) is not None:
        return mod.app
    if hasattr(mod, "create_app"):
        return mod.create_app()
    raise RuntimeError("Impossible de trouver l'app Flask (app ou create_app).")

def test_root_or_health():
    app = _get_app()
    client = app.test_client()
    for path in ("/health", "/"):
        resp = client.get(path)
        if resp.status_code < 400:
            assert resp.status_code == 200
            return
    raise AssertionError("Ni /health ni / ne répond en 2xx")
