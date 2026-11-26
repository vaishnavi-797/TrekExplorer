import json
from pathlib import Path
import threading

_LOCK = threading.Lock()


def read_json_list(path: Path) -> list[dict]:
    """Read a JSON array from disk, returning an empty list if missing."""
    with _LOCK:
        if not path.exists():
            return []
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            return data if isinstance(data, list) else []
        except json.JSONDecodeError:
            return []


def write_json_list(path: Path, items: list[dict]) -> None:
    """Atomically persist a JSON array to disk."""
    with _LOCK:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = path.with_suffix(".tmp")
        tmp_path.write_text(json.dumps(items, indent=2), encoding="utf-8")
        tmp_path.replace(path)
