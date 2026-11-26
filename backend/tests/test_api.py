from pathlib import Path
import tempfile
import unittest

from app.main import create_app
from app.utils.config import Settings


class BackendApiTestCase(unittest.TestCase):
    """Tests for TrekExplorer Flask API endpoints."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        store_path = Path(self.temp_dir.name) / "contacts.json"
        settings = Settings(
            host="127.0.0.1",
            port=8080,
            debug=False,
            allowed_origins="*",
            contact_store_path=store_path,
        )
        self.app = create_app(settings)
        self.client = self.app.test_client()

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_health_endpoint(self) -> None:
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.get_json()["status"], "ok")

    def test_contact_crud_flow(self) -> None:
        resp = self.client.get("/api/contact")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.get_json(), [])

        create_resp = self.client.post(
            "/api/contact",
            json={
                "name": "Aarav",
                "email": "aarav@example.com",
                "message": "Interested in Kalsubai batch.",
            },
        )
        self.assertEqual(create_resp.status_code, 201)
        created = create_resp.get_json()
        self.assertEqual(created["id"], 1)
        self.assertEqual(created["name"], "Aarav")

        list_resp = self.client.get("/api/contact")
        self.assertEqual(len(list_resp.get_json()), 1)

        del_resp = self.client.delete(f"/api/contact/{created['id']}")
        self.assertEqual(del_resp.status_code, 204)

        missing_resp = self.client.delete(f"/api/contact/{created['id']}")
        self.assertEqual(missing_resp.status_code, 404)

    def test_contact_validation(self) -> None:
        resp = self.client.post(
            "/api/contact",
            json={"name": "", "email": "not-an-email", "message": "Hi"},
        )
        self.assertEqual(resp.status_code, 400)

    def test_treks_endpoints(self) -> None:
        list_resp = self.client.get("/api/treks")
        self.assertEqual(list_resp.status_code, 200)
        treks = list_resp.get_json()
        self.assertGreater(len(treks), 0)

        detail_resp = self.client.get("/api/treks/kalsubai")
        self.assertEqual(detail_resp.status_code, 200)
        self.assertEqual(detail_resp.get_json()["id"], "kalsubai")

        missing_resp = self.client.get("/api/treks/nonexistent-trek")
        self.assertEqual(missing_resp.status_code, 404)


if __name__ == "__main__":
    unittest.main()
