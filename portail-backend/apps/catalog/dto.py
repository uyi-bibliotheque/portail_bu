# catalog/dto.py
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class NoticeDTO:
    """Structure de données unifiée pour une notice d'ouvrage/document."""
    id: str
    title: str
    authors: List[str] = field(default_factory=list)
    publisher: str = ""
    publication_year: Optional[int] = None
    isbn: str = ""
    summary: str = ""
    categories: List[str] = field(default_factory=list)
    doc_type: str = "Livre"
    availability_status: str = "Disponible"
    location: str = "Bibliothèque Centrale"
    items: List[dict] = field(default_factory=list)
    
    # Nouveaux champs pour plus de détails
    edition: str = ""
    language: str = "Français"
    pages: Optional[int] = None
    collection: str = ""
    subjects: List[str] = field(default_factory=list)
    contributors: List[str] = field(default_factory=list)
    url_cover: str = ""
    url_full_text: str = ""
    is_available_for_loan: bool = True
    can_be_reserved: bool = True

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "authors": self.authors,
            "publisher": self.publisher,
            "publication_year": self.publication_year,
            "isbn": self.isbn,
            "summary": self.summary,
            "categories": self.categories,
            "doc_type": self.doc_type,
            "availability_status": self.availability_status,
            "location": self.location,
            "items": self.items,
            # Nouveaux champs
            "edition": self.edition,
            "language": self.language,
            "pages": self.pages,
            "collection": self.collection,
            "subjects": self.subjects,
            "contributors": self.contributors,
            "url_cover": self.url_cover,
            "url_full_text": self.url_full_text,
            "is_available_for_loan": self.is_available_for_loan,
            "can_be_reserved": self.can_be_reserved,
        }