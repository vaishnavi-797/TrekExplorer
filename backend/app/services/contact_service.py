from pathlib import Path

from app.models.contact import ContactMessage
from app.utils.storage import read_json_list, write_json_list


class ContactService:
    """Manages CRUD operations for contact messages."""

    def __init__(self, store_path: Path) -> None:
        self.store_path = store_path

    def list_messages(self) -> list[dict]:
        """Return all stored contact messages, newest first."""
        items = read_json_list(self.store_path)
        return sorted(items, key=lambda item: item.get("id", 0), reverse=True)

    def create_message(self, payload: dict) -> dict:
        """Validate, store, and return a newly created contact message."""
        items = read_json_list(self.store_path)
        next_id = max((int(item.get("id", 0)) for item in items), default=0) + 1
        record = ContactMessage.from_payload(next_id, payload).to_dict()
        items.append(record)
        write_json_list(self.store_path, items)
        return record

    def delete_message(self, message_id: int) -> bool:
        """Delete a contact message by ID; return True if deleted."""
        items = read_json_list(self.store_path)
        remaining = [item for item in items if int(item.get("id", -1)) != message_id]
        if len(remaining) == len(items):
            return False
        write_json_list(self.store_path, remaining)
        return True
