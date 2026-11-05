import csv
from pathlib import Path, PurePosixPath

from django.core.management.base import BaseCommand, CommandError

from apps.memoires.archive_index import synchronize_direct_archives


class Command(BaseCommand):
    help = 'Extrait les métadonnées PDF (titre/auteur) des archives et met à jour la base.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Calcule les documents découverts sans enregistrer les changements.',
        )
        parser.add_argument(
            '--csv',
            dest='csv_path',
            help='Utilise les métadonnées validées d’un export_archives_csv.py.',
        )

    def handle(self, *args, **options):
        metadata_by_path = None
        csv_path = options.get('csv_path')
        if csv_path:
            metadata_by_path = self._read_metadata_csv(csv_path)

        if options.get('dry_run'):
            from apps.memoires.archive_index import _iter_documents

            count = sum(1 for _ in _iter_documents(metadata_by_path=metadata_by_path))
            self.stdout.write(self.style.SUCCESS(f'{count} document(s) détecté(s).'))
            return

        synchronize_direct_archives(metadata_by_path)
        self.stdout.write(self.style.SUCCESS('Indexation des archives terminée.'))

    def _read_metadata_csv(self, csv_path):
        path = Path(csv_path)
        if not path.is_file():
            raise CommandError(f'Fichier CSV introuvable : {path}')

        with path.open(encoding='utf-8-sig', newline='') as csv_file:
            sample = csv_file.read(4096)
            csv_file.seek(0)
            try:
                dialect = csv.Sniffer().sniff(sample, delimiters=';,')
            except csv.Error:
                dialect = csv.excel
            reader = csv.reader(csv_file, dialect)
            rows = list(reader)

        required_fields = {'source_path', 'title', 'author_name', 'author_full_name'}
        header = rows[0] if rows else []
        normalized_header = [str(col).strip().strip('"').strip("'").strip() for col in header]
        header_lookup = {name: idx for idx, name in enumerate(normalized_header) if name}

        metadata_by_path = {}
        for row in rows[1:]:
            if not row or not any((cell or '').strip() for cell in row):
                continue

            if required_fields.issubset(set(header_lookup)):
                source_index = header_lookup['source_path']
                source_cell = str(row[source_index]).strip() if source_index < len(row) else ''
            else:
                source_index = next(
                    (
                        idx for idx, cell in enumerate(row)
                        if str(cell).strip().startswith(('MEMOIRES/', 'THESES/'))
                    ),
                    None,
                )
                source_cell = str(row[source_index]).strip() if source_index is not None else ''

            if not source_cell:
                continue

            source_path = PurePosixPath(source_cell)
            if (
                source_path.is_absolute()
                or not source_path.parts
                or source_path.parts[0] not in {'MEMOIRES', 'THESES'}
                or '..' in source_path.parts
            ):
                continue

            relative_path = source_path.as_posix()
            if relative_path in metadata_by_path:
                raise CommandError(f'Chemin d’archive dupliqué dans le CSV : {relative_path}')

            title = ''
            author_name = ''
            author_full_name = ''

            last_nonempty_index = max(
                (idx for idx, value in enumerate(row) if str(value or '').strip()),
                default=-1,
            )
            has_unquoted_commas = last_nonempty_index + 1 > len(header_lookup)

            if required_fields.issubset(set(header_lookup)) and not has_unquoted_commas:
                title_index = header_lookup.get('title')
                author_name_index = header_lookup.get('author_name')
                author_full_name_index = header_lookup.get('author_full_name')
                if title_index is not None and title_index < len(row):
                    title = str(row[title_index] or '').replace('\x00', ' ').strip()
                if author_name_index is not None and author_name_index < len(row):
                    author_name = str(row[author_name_index] or '').replace('\x00', ' ').strip()
                if author_full_name_index is not None and author_full_name_index < len(row):
                    author_full_name = str(row[author_full_name_index] or '').replace('\x00', ' ').strip()

            if has_unquoted_commas:
                file_size_index = last_nonempty_index
                title_source_index = file_size_index - 2
                author_full_name_index = title_source_index - 1
                author_name_index = title_source_index - 2
                if author_name_index <= 5 or file_size_index < 0:
                    raise CommandError(
                        f'Format CSV incorrect pour les métadonnées de : {relative_path}'
                    )
                title = ', '.join(
                    str(value or '').strip()
                    for value in row[5:author_name_index]
                    if str(value or '').strip()
                )
                author_name = str(row[author_name_index] or '').strip()
                author_full_name = str(row[author_full_name_index] or '').strip()
            elif not title or not author_name:
                title_parts = []
                author_candidates = []
                for idx, cell in enumerate(row[5:], start=5):
                    value = str(cell or '').strip()
                    if not value:
                        continue
                    if value in {'pdf_text', 'pdf_text_presented_by'}:
                        break
                    if idx >= 8:
                        author_candidates.append(value)
                    else:
                        title_parts.append(value)
                title = ' '.join(title_parts).strip()
                if not author_name:
                    author_name = author_candidates[0].strip() if author_candidates else ''
                if not author_full_name:
                    author_full_name = author_candidates[1].strip() if len(author_candidates) > 1 else author_name

            title = self._clean_csv_text(title)
            author_name = self._clean_csv_text(author_name)
            author_full_name = self._clean_csv_text(author_full_name)
            if not title:
                raise CommandError(f'Titre manquant dans le CSV pour : {relative_path}')

            metadata_by_path[relative_path] = {
                'title': title[:500],
                'author_name': author_name or author_full_name,
                'author_full_name': author_full_name or author_name,
            }

        if not metadata_by_path:
            raise CommandError(
                'Le CSV doit contenir les colonnes source_path, title, author_name et author_full_name.'
            )

        return metadata_by_path

    def _clean_csv_text(self, value):
        return (str(value or '').replace('\x00', ' ').replace('\r', ' ').replace('\n', ' ').strip())
