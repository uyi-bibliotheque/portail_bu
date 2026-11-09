import csv
import json
import posixpath
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from catalog.models import PhysicalArchiveRecord, normalize_search_text


NAMESPACE = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
RELATIONSHIP_NAMESPACE = (
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
)
HEADER_ALIASES = {
    'document_type': ('choix du support du document', 'support', 'type', 'type de document', 'document type', 'nature'),
    'title': ('titre propre', 'titre', 'titre du document', 'titre du memoire', 'title', 'document title', 'dissertation title'),
    'author': ('auteur principal', 'auteur', 'author', 'primary author'),
    'director': ('directeur de these', 'directeur', 'encadreur', 'supervisor', 'director'),
    'publication_info': ('adresse', 'lieu et editeur', 'publication', 'publication information'),
    'degree_department': ('grade et departement', 'grade', 'diplome et departement', 'degree and department'),
    'physical_description': ('importance materielle', 'description physique', 'physical description'),
    'physical_details': ('autres caracteristiques materielles', 'caracteristiques materielles', 'physical details'),
    'document_format': ('format', 'dimension'),
    'accompanying_material': ('materiel d accompagnement', 'materiel accompagnement', 'accompanying material'),
    'general_note': ('note generale', 'note', 'general note'),
    'classification': ('indexation decimale', 'classification', 'indice de classification'),
    'keywords': ('mots cles', 'mot cle', 'mots-cles', 'keywords', 'descripteurs', 'subjects'),
    'language': ('langue', 'language'),
    'copy_count': (
        'nbre d exemplaire',
        'nbre dexemplaire',
        'nombre d exemplaires',
        'nombre dexemplaires',
        'nombre exemplaire',
        'copies',
        'copy count',
    ),
    'copy_number': (
        'numero des exemplaires avec leurs particularites',
        'numero dexemplaire',
        'numero exemplaire',
        'numero des exemplaires',
        'numero d inventaire',
        'numero dinventaire',
        'accession number',
        'copy number',
    ),
    'shelfmark': ('cote', 'cote du document', 'shelfmark', 'call number', 'classification mark'),
}
MAX_XLSX_UNCOMPRESSED_SIZE = 100 * 1024 * 1024


def _clean(value):
    return ' '.join(str(value or '').replace('\x00', ' ').split())


def _column_mapping(headers):
    aliases = {
        normalize_search_text(alias): field
        for field, names in HEADER_ALIASES.items()
        for alias in names
    }
    mapping = {}
    for index, header in enumerate(headers):
        field = aliases.get(normalize_search_text(header))
        if field and field not in mapping:
            mapping[field] = index
    return mapping


def _find_header(rows):
    for index, row in enumerate(rows[:30]):
        mapping = _column_mapping(row)
        if 'title' in mapping and len(mapping) >= 2:
            return index, mapping
    return None, {}


def _column_index(cell_reference):
    letters = re.match(r'[A-Z]+', cell_reference or '')
    if not letters:
        return None
    column = 0
    for character in letters.group(0):
        column = column * 26 + ord(character) - ord('A') + 1
    return column - 1


def _shared_strings(archive):
    try:
        shared_strings_xml = archive.read('xl/sharedStrings.xml')
    except KeyError:
        return []

    root = ElementTree.fromstring(shared_strings_xml)
    return [
        ''.join(text.text or '' for text in item.findall('.//main:t', NAMESPACE))
        for item in root.findall('main:si', NAMESPACE)
    ]


def _cell_value(cell, shared_strings):
    value = cell.find('main:v', NAMESPACE)
    cell_type = cell.attrib.get('t')
    if cell_type == 's' and value is not None:
        return shared_strings[int(value.text)]
    if cell_type == 'inlineStr':
        return ''.join(
            text.text or ''
            for text in cell.findall('.//main:t', NAMESPACE)
        )
    return value.text if value is not None else ''


def _read_xlsx_sheets(path):
    try:
        with zipfile.ZipFile(path) as archive:
            total_size = sum(item.file_size for item in archive.infolist())
            if total_size > MAX_XLSX_UNCOMPRESSED_SIZE:
                raise CommandError(
                    f'Le classeur dépasse la limite de taille décompressée (100 Mio) : {path}'
                )

            workbook = ElementTree.fromstring(archive.read('xl/workbook.xml'))
            relationships = ElementTree.fromstring(
                archive.read('xl/_rels/workbook.xml.rels')
            )
            targets = {
                relationship.attrib['Id']: relationship.attrib['Target']
                for relationship in relationships
            }
            shared_strings = _shared_strings(archive)
            sheets = workbook.findall('main:sheets/main:sheet', NAMESPACE)

            for sheet in sheets:
                sheet_name = sheet.attrib.get('name', 'Feuille')
                relationship_id = sheet.attrib.get(
                    f'{{{RELATIONSHIP_NAMESPACE}}}id'
                )
                target = targets.get(relationship_id)
                if not target:
                    raise CommandError(
                        f'Lien de feuille manquant dans le classeur {path} : {sheet_name}'
                    )

                worksheet_path = (
                    target.lstrip('/')
                    if target.startswith('/')
                    else posixpath.normpath(posixpath.join('xl', target))
                )
                worksheet = ElementTree.fromstring(archive.read(worksheet_path))
                rows = []
                for row in worksheet.findall('main:sheetData/main:row', NAMESPACE):
                    values = {}
                    for cell in row.findall('main:c', NAMESPACE):
                        column = _column_index(cell.attrib.get('r', ''))
                        if column is not None:
                            values[column] = _cell_value(cell, shared_strings)
                    rows.append((int(row.attrib.get('r', len(rows) + 1)), values))
                yield sheet_name, rows
    except zipfile.BadZipFile as error:
        raise CommandError(f'Le fichier XLSX est invalide : {path}') from error
    except ElementTree.ParseError as error:
        raise CommandError(f'Le XML du classeur est invalide : {path}') from error
    except KeyError as error:
        raise CommandError(f'Le classeur est incomplet : {path}') from error


def _iter_rows(path):
    if path.suffix.lower() == '.xlsx':
        for sheet_name, indexed_rows in _read_xlsx_sheets(path):
            rows = [
                [
                    values.get(index, '')
                    for index in range(max(values, default=-1) + 1)
                ]
                for _, values in indexed_rows
            ]
            header_index, mapping = _find_header(rows)
            if header_index is None:
                continue
            for row_number, values in indexed_rows[header_index + 1:]:
                yield sheet_name, row_number, mapping, values
        return

    if path.suffix.lower() != '.csv':
        raise CommandError(f'Format non pris en charge : {path.suffix or "(sans extension)"}')

    with path.open(encoding='utf-8-sig', newline='') as csv_file:
        sample = csv_file.read(4096)
        csv_file.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=';,\t')
        except csv.Error:
            dialect = csv.excel
        rows = list(csv.reader(csv_file, dialect))

    header_index, mapping = _find_header(rows)
    if header_index is None:
        raise CommandError(f'Aucune ligne d’en-tête reconnue dans le fichier : {path}')
    for row_number, row in enumerate(rows[header_index + 1:], start=header_index + 2):
        yield 'CSV', row_number, mapping, row


def _record_value(row, mapping, field):
    index = mapping.get(field)
    if index is None:
        return ''
    if isinstance(row, dict):
        return _clean(row.get(index, ''))
    return _clean(row[index] if index < len(row) else '')


def _source_name(path):
    documents_root = Path(settings.DOCUMENTS_ROOT).resolve()
    try:
        return path.resolve().relative_to(documents_root).as_posix()
    except ValueError:
        return path.name


def _records_for_file(path):
    source_file = _source_name(path)
    records_by_sheet = {}
    skipped_without_title = 0
    for sheet_name, row_number, mapping, row in _iter_rows(path):
        title = _record_value(row, mapping, 'title')
        if not title:
            skipped_without_title += 1
            continue

        values = {
            'source_file': source_file[:512],
            'source_sheet': sheet_name[:128],
            'source_row': row_number,
            'document_type': _record_value(row, mapping, 'document_type')[:128],
            'title': title[:1000],
            'author': _record_value(row, mapping, 'author')[:255],
            'director': _record_value(row, mapping, 'director')[:255],
            'publication_info': _record_value(row, mapping, 'publication_info')[:500],
            'degree_department': _record_value(row, mapping, 'degree_department')[:500],
            'physical_description': _record_value(row, mapping, 'physical_description')[:255],
            'physical_details': _record_value(row, mapping, 'physical_details')[:255],
            'document_format': _record_value(row, mapping, 'document_format')[:64],
            'accompanying_material': _record_value(row, mapping, 'accompanying_material')[:255],
            'general_note': _record_value(row, mapping, 'general_note'),
            'classification': _record_value(row, mapping, 'classification')[:128],
            'keywords': _record_value(row, mapping, 'keywords'),
            'language': _record_value(row, mapping, 'language')[:64],
            'copy_count': _record_value(row, mapping, 'copy_count')[:32],
            'copy_number': _record_value(row, mapping, 'copy_number')[:255],
            'shelfmark': _record_value(row, mapping, 'shelfmark')[:255],
        }
        searchable_values = (
            values['title'],
            values['author'],
            values['director'],
            values['document_type'],
            values['publication_info'],
            values['degree_department'],
            values['classification'],
            values['keywords'],
            values['language'],
            values['copy_number'],
            values['shelfmark'],
        )
        values['search_text'] = normalize_search_text(' '.join(searchable_values))
        records_by_sheet.setdefault(sheet_name[:128], []).append(values)

    return records_by_sheet, skipped_without_title


class Command(BaseCommand):
    help = 'Importe les notices de mémoires et thèses conservés physiquement à la bibliothèque.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            dest='files',
            action='append',
            help='Fichier .xlsx ou .csv à importer. Peut être répété.',
        )
        parser.add_argument(
            '--files-json',
            help='Liste JSON de fichiers .xlsx/.csv, pratique pour la configuration Docker.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Analyse les fichiers sans modifier la base de données.',
        )

    def handle(self, *args, **options):
        files = list(options.get('files') or [])
        files_json = options.get('files_json')
        if files_json:
            try:
                configured_files = json.loads(files_json)
            except json.JSONDecodeError as error:
                raise CommandError('--files-json doit contenir une liste JSON valide.') from error
            if not isinstance(configured_files, list) or not all(
                isinstance(filename, str) and filename.strip()
                for filename in configured_files
            ):
                raise CommandError('--files-json doit être une liste de chemins non vides.')
            files.extend(configured_files)

        if not files:
            raise CommandError('Indiquez au moins un fichier avec --file ou --files-json.')

        batches = []
        total_rows = 0
        skipped_rows = 0
        for filename in files:
            path = Path(filename)
            if not path.is_file():
                raise CommandError(f'Fichier de données introuvable : {path}')
            records_by_sheet, skipped = _records_for_file(path)
            file_count = sum(len(records) for records in records_by_sheet.values())
            if file_count == 0:
                raise CommandError(f'Aucune ligne avec titre exploitable trouvée dans : {path}')
            batches.append((path, records_by_sheet))
            total_rows += file_count
            skipped_rows += skipped
            self.stdout.write(f'{path.name} : {file_count} notice(s) exploitable(s).')

        if options['dry_run']:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Analyse terminée : {total_rows} notice(s), '
                    f'{skipped_rows} ligne(s) ignorée(s) sans titre.'
                )
            )
            return

        created_count = 0
        updated_count = 0
        now = timezone.now()
        with transaction.atomic():
            for _, records_by_sheet in batches:
                for sheet_name, records in records_by_sheet.items():
                    if not records:
                        continue
                    source_file = records[0]['source_file']
                    existing = {
                        record.source_row: record
                        for record in PhysicalArchiveRecord.objects.filter(
                            source_file=source_file,
                            source_sheet=sheet_name,
                        )
                    }
                    PhysicalArchiveRecord.objects.filter(
                        source_file=source_file,
                        source_sheet=sheet_name,
                    ).update(is_active=False)

                    to_create = []
                    to_update = []
                    update_fields = [
                        'document_type', 'title', 'author', 'director',
                        'publication_info', 'degree_department',
                        'physical_description', 'physical_details',
                        'document_format', 'accompanying_material',
                        'general_note', 'classification', 'keywords',
                        'language', 'copy_count', 'copy_number', 'shelfmark',
                        'search_text',
                    ]
                    for values in records:
                        record = existing.get(values['source_row'])
                        if record is None:
                            to_create.append(PhysicalArchiveRecord(**values))
                            continue

                        changed = False
                        for field in update_fields:
                            value = values[field]
                            if getattr(record, field) != value:
                                setattr(record, field, value)
                                changed = True
                        if not record.is_active:
                            record.is_active = True
                            changed = True
                        if changed:
                            record.imported_at = now
                            to_update.append(record)

                    if to_create:
                        PhysicalArchiveRecord.objects.bulk_create(to_create)
                        created_count += len(to_create)
                    if to_update:
                        PhysicalArchiveRecord.objects.bulk_update(
                            to_update,
                            [*update_fields, 'is_active', 'imported_at'],
                        )
                        updated_count += len(to_update)

                    seen_rows = {record['source_row'] for record in records}
                    stale_ids = [
                        record.pk for row_number, record in existing.items()
                        if row_number not in seen_rows and record.is_active
                    ]
                    for start in range(0, len(stale_ids), 500):
                        PhysicalArchiveRecord.objects.filter(
                            pk__in=stale_ids[start:start + 500]
                        ).update(is_active=False)

        self.stdout.write(
            self.style.SUCCESS(
                f'Import terminé : {created_count} créée(s), {updated_count} mise(s) à jour, '
                f'{skipped_rows} ligne(s) ignorée(s) sans titre.'
            )
        )
