from dataclasses import dataclass, asdict
from datetime import datetime, timezone
import re

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@dataclass
class ContactMessage:
    """Represents a customer contact inquiry."""

    id: int
    name: str
    email: str
    message: str
    createdAt: str

    @classmethod
    def from_payload(cls, message_id: int, payload: dict) -> "ContactMessage":
        """Validate incoming contact payload and construct a ContactMessage."""
        if not isinstance(payload, dict):
            raise ValueError("Invalid JSON payload.")

        name = str(payload.get("name", "")).strip()
        email = str(payload.get("email", "")).strip()
        message = str(payload.get("message", "")).strip()

        if not name:
            raise ValueError("Name is required.")
        if not email or not EMAIL_RE.match(email):
            raise ValueError("A valid email address is required.")
        if not message:
            raise ValueError("Message is required.")

        created_at = datetime.now(timezone.utc).isoformat()
        return cls(
            id=message_id,
            name=name,
            email=email,
            message=message,
            createdAt=created_at,
        )

    def to_dict(self) -> dict:
        """Serialize message for JSON API responses."""
        return asdict(self)
