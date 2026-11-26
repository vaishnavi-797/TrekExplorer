from dataclasses import dataclass, asdict


@dataclass(frozen=True)
class TrekSummary:
    """Lightweight trek metadata representation."""

    id: str
    name: str
    category: str
    region: str
    price: int
    difficulty: str
    height: str

    def to_dict(self) -> dict:
        """Serialize trek summary for JSON responses."""
        return asdict(self)
