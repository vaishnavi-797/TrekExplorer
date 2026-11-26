from dataclasses import dataclass
from pathlib import Path
import os

BACKEND_ROOT = Path(__file__).resolve().parents[2]


def _load_dotenv(env_path: Path) -> None:
    """Load key=value pairs from .env if present without external dependencies."""
    if not env_path.is_file():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@dataclass(frozen=True)
class Settings:
    """Runtime settings loaded from environment variables."""

    host: str
    port: int
    debug: bool
    allowed_origins: str
    contact_store_path: Path


def get_settings() -> Settings:
    """Build application Settings from environment and optional .env file."""
    _load_dotenv(BACKEND_ROOT / ".env")
    raw_store = os.getenv("CONTACT_STORE_PATH", "data/contacts.json")
    store_path = Path(raw_store)
    if not store_path.is_absolute():
        store_path = BACKEND_ROOT / store_path

    return Settings(
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8080")),
        debug=os.getenv("DEBUG", "false").lower() in ("1", "true", "yes"),
        allowed_origins=os.getenv("ALLOWED_ORIGINS", "*"),
        contact_store_path=store_path,
    )
