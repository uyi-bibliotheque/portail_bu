import os
import re
from datetime import datetime, timezone as datetime_timezone
from pathlib import Path

from django.conf import settings
from django.db import transaction

from .models import DirectArchiveDocument


YEAR_PATTERN = re.compile(r'^(19|20)\d{2}$')


def _iter_documents():
    documents_root = Path(settings.DOCUMENTS_ROOT).resolve()
    if not documents_root.is_dir():
        raise FileNotFoundError(f'Dossier documentaire introuvable: {documents_root}')

    def raise_walk_error(error):
        raise error

    for collection, document_type in (
        ('MEMOIRES', DirectArchiveDocument.TypeDocument.MEMOIRE),
        ('THESES', DirectArchiveDocument.TypeDocument.THESE),
    ):
        collection_root = documents_root / collection
        if not collection_root.is_dir():
            raise FileNotFoundError(f'Dossier documentaire introuvable: {collection_root}')

        for current_dir, directories, filenames in os.walk(
            collection_root,
            followlinks=False,
            onerror=raise_walk_error,
        ):
            directories[:] = sorted(
                name for name in directories
                if not (Path(current_dir) / name).is_symlink()
            )
            for filename in sorted(filenames):
                path = Path(current_dir) / filename
                if path.suffix.lower() != '.pdf' or path.is_symlink():
                    continue

                try:
                    resolved_path = path.resolve(strict=True)
                    relative_to_root = resolved_path.relative_to(documents_root)
                    stat = resolved_path.stat()
                except FileNotFoundError:
                    continue
                except ValueError:
                    continue

                if not resolved_path.is_file():
                    continue

                parts = relative_to_root.parts
                faculty = parts[1].strip().upper() if len(parts) > 2 else 'AUTRE'
                year = next(
                    (int(part) for part in parts[2:-1] if YEAR_PATTERN.fullmatch(part)),
                    None,
                )
                document_name = resolved_path.name[:255]
                title = resolved_path.stem.replace('_', ' ').strip()[:500]
                modified_at = datetime.fromtimestamp(stat.st_mtime, tz=datetime_timezone.utc)

                yield {
                    'source_path': relative_to_root.as_posix(),
                    'document_name': document_name,
                    'title': title or document_name,
                    'type_document': document_type,
                    'faculty': faculty[:64] or 'AUTRE',
                    'year': year,
                    'file_size': stat.st_size,
                    'modified_at': modified_at,
                }


def synchronize_direct_archives():
    discovered = {entry['source_path']: entry for entry in _iter_documents()}

    with transaction.atomic():
        existing = {
            document.source_path: document
            for document in DirectArchiveDocument.objects.all()
        }
        to_create = []
        to_update = []

        for source_path, values in discovered.items():
            document = existing.get(source_path)
            if document is None:
                to_create.append(DirectArchiveDocument(**values))
                continue

            changed = False
            for field, value in values.items():
                if getattr(document, field) != value:
                    setattr(document, field, value)
                    changed = True
            if not document.is_available:
                document.is_available = True
                changed = True
            if changed:
                to_update.append(document)

        if to_create:
            DirectArchiveDocument.objects.bulk_create(to_create, ignore_conflicts=True)
        if to_update:
            DirectArchiveDocument.objects.bulk_update(
                to_update,
                [
                    'document_name', 'title', 'type_document', 'faculty', 'year',
                    'file_size', 'modified_at', 'is_available',
                ],
            )

        stale_ids = [
            document.pk
            for source_path, document in existing.items()
            if source_path not in discovered and document.is_available
        ]
        if stale_ids:
            DirectArchiveDocument.objects.filter(pk__in=stale_ids).update(is_available=False)

    return len(to_create)
