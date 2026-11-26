import json
from pathlib import Path
import re

from app.models.trek import TrekSummary

PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_TREKS_JS = PROJECT_ROOT / "frontend" / "src" / "services" / "treks.js"


def load_treks(treks_js_path: Path = DEFAULT_TREKS_JS) -> dict[str, dict]:
    """Load the trek catalog from the frontend treks.js module."""
    if not treks_js_path.is_file():
        return {}
    text = treks_js_path.read_text(encoding="utf-8")
    match = re.search(r"export const TREKS\s*=\s*(\{.*\})\s*;?\s*$", text, re.DOTALL)
    if not match:
        return {}
    return json.loads(match.group(1))


class TrekService:
    """Provides read-only access to the TrekExplorer trek catalog."""

    def __init__(self, treks_js_path: Path = DEFAULT_TREKS_JS) -> None:
        self.treks_js_path = treks_js_path

    def list_treks(self, category: str | None = None) -> list[dict]:
        """Return trek summaries, optionally filtered by category."""
        treks = load_treks(self.treks_js_path)
        results = []
        for item in treks.values():
            if category and item.get("category") != category:
                continue
            summary = TrekSummary(
                id=str(item.get("id", "")),
                name=str(item.get("name", "")),
                category=str(item.get("category", "")),
                region=str(item.get("region", "")),
                price=int(item.get("price", 0)),
                difficulty=str(item.get("difficulty", "")),
                height=str(item.get("height", "")),
            )
            results.append(summary.to_dict())
        return results

    def get_trek(self, trek_id: str) -> dict | None:
        """Return full details for a single trek by ID, or None if missing."""
        return load_treks(self.treks_js_path).get(trek_id)
