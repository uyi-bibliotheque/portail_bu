import logging
import re
from pathlib import Path
from typing import Optional

from pypdf import PdfReader


logger = logging.getLogger(__name__)

AUTHOR_LABEL = re.compile(
    r'^(?:présent(?:é|ée|és|ées)(?:\s+et\s+soutenu)?\s+par|'
    r'soutenu\s+par|presented\s+by|par|by)'
    r'\s*[:\-–]?\s*(.*)$',
    re.IGNORECASE,
)
TITLE_LABEL = re.compile(
    r'^(?:titre(?:\s+(?:du|de la)\s+(?:m[eé]moire|th[eè]se))?|'
    r'th[eè]me|sujet(?:\s+de\s+(?:m[eé]moire|th[eè]se))?|'
    r'title|research\s+topic)\s*[:\-–]\s*(.*)$',
    re.IGNORECASE,
)
NAME_STOP_LINE = re.compile(
    r'^(?:matricule|supervis(?:ed|or)|sous la direction|encadr[ée]|'
    r'pr[eé]sident|rapporteur|examinateur|examiner|jury|membre|member|'
    r'department|faculty|university|school|college|centre|center|'
    r'd[eé]partement|facult[eé]|universit[eé]|laboratoire|'
    r'licenci[ée]e?|licence|dipl[oô]m[ée]|ing[eé]nieur|bachelor|'
    r'b\.?\s*a\.?(?=\s|\.|$|[,(])|b\.?\s*s\.?(?=\s|\.|$|[,(])|master|'
    r'doctorat|th[eè]se|m[eé]moire|'
    r'année|academic year|option|specialty|speciali[sz]ation|sp[eé]cialit[eé]|'
    r'en vue|submitted|dissertation|degree|jury|mention|'
    r'titulaire|holder of|matricule|ma[iî]tre|professeur|professor|lecturer)\b',
    re.IGNORECASE,
)
TITLE_STOP_LINE = re.compile(
    r'^(?:présent(?:é|ée|és|ées)?|presented|par|by|matricule|supervis|'
    r'pr[eé]sident|rapporteur|examinateur|examiner|membre|member|jury|'
    r'sous la direction|licenci[ée]|bachelor|master|doctorat|année|'
    r'academic year|option|specialty|speciali[sz]ation|spécialité|en vue|submitted|'
    r'dissertation|degree|ma[iî]tre|professeur|professor|lecturer)\b',
    re.IGNORECASE,
)
TITLE_EXCLUSION_PREFIXES = (
    'UNIVERSIT', 'FACULT', 'SCHOOL', 'CENTRE', 'CENTER', 'REPUBLIC',
    'PAIX', 'TRAVAIL', 'PATRIE', 'FORMATION DOCTORALE', 'RESEARCH UNIT',
    'DOCTORAL', 'ACADEMIC YEAR', 'ANNÉE ACADÉMIQUE', 'MASTER DEGREE',
    'MASTER EN', 'DIPLOME', 'DISSERTATION SUBMITTED', 'MEMOIRE REDIGE',
    'MÉMOIRE RÉDIGÉ', 'PRESENTED IN PARTIAL', 'PRÉSENTÉ EN VUE',
    'THESIS PRESENTED', 'DISSERTATION PRESENTED', 'THESIS SUBMITTED',
    'REQUIREMENTS FOR THE AWARD',
    'SCIENCES HUMAINES', 'SOCIAL AND EDUCATIONAL SCIENCES', 'DEPARTMENT',
    'DEPARTEMENT', 'DOCTORAL RESEARCH', 'RESEARCH AND DOCTORAL',
    'UNITÉ DE RECHERCHE', 'UNITE DE RECHERCHE', 'THE UNIVERSITY',
    'POST GRADUATE', 'POST GRATUATE', 'POSTGRADUATE',
    'HUMAN, SOCIAL AND EDUCATIONAL', 'SOCIAL AND EDUCATIONAL',
    'EDUCATOINAL AND SOCIAL', 'AND EDUCATIVE SCIENCES',
    'SCIENCES, TECHNOLOGIES', 'SCIENCES TECHNOLOGIES',
    'HEALTH & ENVIRONMENTAL SCIENCES', 'STUDIES IN LIFE. HEALTH',
    'LA VIE, SANTE ET ENVIRONNEMENT', 'TECHNOLOGY AND GEOSCIENCES',
    'TECHNOLOGIE ET GEOSCIENCES', 'INORGANIC CHEMISTRY DEPARTMENT',
    'QUALITÉ', 'QUALITE', 'NOMS ET PRÉNOMS', 'NOMS ET PRENOMS',
    'SECTION ', 'ATTESTATION DE CORRECTION', 'THESE THESE',
    'THE SOCIAL AND EDUCATIONAL', 'FOR THE SOCIAL AND',
    'SCIENCES DOCTORAL', 'SCIENCE HUMAINES', 'HUMAINES ET',
    'HUMAINES ET SOCIALES', 'EDUCATIVES',
    'FORMATION EN SCIENCES', 'FORMATION IN HUMAN',
    'FORMATION DE DOCTORAT', 'RESEARCH AND TRAINING IN', 'TRAINING UNIT',
    'EDUCATION AND EDUCATIONAL', 'SPECIALISATION', 'SPECIALIZATION',
    'CENTRE FOR RESEARCH AND TRAINING', 'FACULTY OF SCIENCE',
    'LA VIE, SANTE ET ENVIRONNEMENT',
    'L’EDUCATION ET DE L’INGENIERIE',
    'MÉMOIRE PRÉSENTÉ', 'MEMOIRE PRESENTE', 'THÈSE PRÉSENTÉE',
    'THESE PRESENTEE', 'A DISSERTATION', 'DISSERTATION SUBMITTED',
    'A THESIS', 'SPECIALTY:', 'OPTION:',
    'PAR:', 'BY:',
)
GENERIC_METADATA = {
    'acer', 'adobe', 'dell', 'expert', 'hp', 'microsoft word', 'unknown',
    'user', 'sweet', 'wonderland',
}
AUTHOR_QUALIFICATION = re.compile(
    r'licenci[ée]e?|licence|bachelor|bsc|'
    r'b\.?\s*a\.?(?=\s|\.|$|[,(])|b\.?\s*s\.?(?=\s|\.|$|[,(])|'
    r'm\.?sc|master|dea|dipes|'
    r'matricule|professeur|supervis(?:ed|or)|titulaire|holder of',
    re.IGNORECASE,
)
INVALID_AUTHOR = re.compile(
    r'fulfillment|requirements|award of|président|president|rapporteur|'
    r'examinateur|examiner|jury|supervis|matricule|licence|bachelor|'
    r'master|doctorat|th[eè]se|m[eé]moire',
    re.IGNORECASE,
)
GENERIC_TITLES = {
    'abstract', 'revue de la litterature', 'revue de littérature',
    'sommaire', 'table of contents',
}
GENERIC_TITLE_PREFIXES = (
    'microsoft word', 'couverture_', 'attestation de correction',
)


def _clean_text(value: Optional[str], limit: int) -> str:
    if not value:
        return ''
    if isinstance(value, bytes):
        value = value.decode('utf-8', errors='replace')
    elif not isinstance(value, str):
        value = str(value)
    cleaned = re.sub(r'\s+', ' ', value.replace('\x00', ' ')).strip()
    return cleaned[:limit]


def _usable_metadata_value(value: Optional[str]) -> str:
    cleaned = _clean_text(value, 500)
    if cleaned.casefold() in GENERIC_METADATA:
        return ''
    if cleaned.casefold() in GENERIC_TITLES:
        return ''
    if cleaned.casefold().startswith(GENERIC_TITLE_PREFIXES):
        return ''
    if '\ufffd' in cleaned or len(cleaned.split()) < 2:
        return ''
    return cleaned


def _get_lines(text: str) -> list[str]:
    return [
        re.sub(r'\s+', ' ', line.replace('\x00', ' ')).strip()
        for line in text.splitlines()
    ]


def _join_lines(lines: list[str], limit: int) -> str:
    joined_lines = []
    for line in lines:
        if joined_lines and joined_lines[-1].endswith('-') and line[:1].isalpha():
            joined_lines[-1] += line
        else:
            joined_lines.append(line)
    return _clean_text(' '.join(joined_lines), limit)


def _collect_following_lines(lines: list[str], start: int, first_value: str, limit: int) -> str:
    first_value = re.split(
        r'\b(?:department|faculty|university|school|college|centre|center|'
        r'd[eé]partement|facult[eé]|universit[eé]|laboratoire)\b',
        first_value,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0].strip(' ,;:-')
    values = [first_value] if first_value else []
    for line in lines[start + 1:]:
        if not line:
            if values:
                break
            continue
        if NAME_STOP_LINE.match(line) or AUTHOR_LABEL.match(line):
            break
        if len(line) > 120 or re.search(r'\d', line):
            break
        values.append(line)
        if len(values) >= limit:
            break
    author = _join_lines(values, 255)
    qualification = AUTHOR_QUALIFICATION.search(author)
    if qualification:
        author = author[:qualification.start()].strip(' ,;:-()')
    return author


def _extract_author(text: str) -> str:
    lines = _get_lines(text)
    for index, line in enumerate(lines):
        match = AUTHOR_LABEL.match(line)
        if not match:
            continue
        author = _collect_following_lines(lines, index, match.group(1).strip(), 2)
        if author and not re.search(r'[!?;]', author) and not INVALID_AUTHOR.search(author):
            return author
    return ''


def _extract_labeled_title(text: str) -> str:
    lines = _get_lines(text)
    for index, line in enumerate(lines):
        match = TITLE_LABEL.match(line)
        if not match:
            continue

        title_lines = [match.group(1).strip()] if match.group(1).strip() else []
        for following_line in lines[index + 1:]:
            if not following_line:
                if title_lines:
                    break
                continue
            if TITLE_STOP_LINE.match(following_line):
                break
            title_lines.append(following_line)
            if len(title_lines) >= 8:
                break
        title = _join_lines(title_lines, 500)
        if title:
            return title
    return ''


def _extract_title_after_date(text: str) -> str:
    lines = _get_lines(text)
    date_line = re.compile(
        r'^(?:(?:ann[eé]e|academic year)\s*[:\-]?\s*)?'
        r'(?:(?:janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|'
        r'septembre|octobre|novembre|d[eé]cembre|january|february|march|'
        r'april|june|july|august|september|october|november|december)'
        r'\s*,?\s*)?(?:19\d{2}|20\d{2}(?:\s*[-/]\s*(?:20)?\d{2})?)$',
        re.IGNORECASE,
    )
    date_indices = [index for index, line in enumerate(lines) if date_line.fullmatch(line)]
    if not date_indices:
        return ''

    title_lines = []
    started = False
    for line in lines[date_indices[0] + 1:]:
        if not line:
            continue
        if re.fullmatch(r'[*\-–—]{3,}', line):
            continue
        upper_line = line.upper()
        excluded = (
            upper_line.startswith(TITLE_EXCLUSION_PREFIXES)
            or TITLE_STOP_LINE.match(line)
        )
        if excluded:
            if started:
                break
            continue

        if not started:
            letters = [character for character in line if character.isalpha()]
            uppercase = bool(letters) and sum(character.isupper() for character in letters) / len(letters) >= 0.75
            if len(line) < 20 or len(line.split()) < 3:
                continue
            if not uppercase and (len(line) < 35 or len(line.split()) < 5):
                continue
            started = True

        if re.fullmatch(r'(?:[A-Z]\s+){1,5}[A-Z]|[A-Z]', line):
            continue
        title_lines.append(line)
        if len(title_lines) >= 8:
            break

    return _join_lines(title_lines, 500)


def _extract_uppercase_title(text: str) -> str:
    candidates = []
    current = []
    blank_lines = 0

    def finish_candidate():
        if current:
            candidate = _join_lines(current, 500)
            if len(candidate.split()) >= 3 and len(candidate) >= 18:
                candidates.append(candidate)
            current.clear()

    for line in _get_lines(text):
        if not line:
            blank_lines += 1
            if blank_lines > 1:
                finish_candidate()
            continue
        blank_lines = 0
        letters = [character for character in line if character.isalpha()]
        is_uppercase = bool(letters) and sum(character.isupper() for character in letters) / len(letters) >= 0.75
        is_excluded = (
            line.upper().startswith(TITLE_EXCLUSION_PREFIXES)
            or TITLE_STOP_LINE.match(line)
        )
        is_title_case = len(line) >= 35 and len(line.split()) >= 5
        is_continuation = (
            bool(current)
            and len(line) < 35
            and len(line.split()) >= 2
            and not NAME_STOP_LINE.match(line)
            and not re.search(r'\d', line)
        )
        if (
            (is_uppercase or is_title_case or is_continuation)
            and not is_excluded
            and (len(line.split()) >= 2 or current)
        ):
            current.append(line)
        else:
            finish_candidate()
    finish_candidate()
    return max(candidates, key=len, default='')


def extract_pdf_metadata(pdf_path: str | Path) -> dict:
    path = Path(pdf_path)
    result = {
        'title': '',
        'author_name': '',
        'author_full_name': '',
        'title_source': '',
        'author_source': '',
    }

    if not path.exists() or path.suffix.lower() != '.pdf':
        return result

    page_texts = []
    text = ''
    metadata = {}
    try:
        with path.open('rb') as pdf_file:
            reader = PdfReader(pdf_file, strict=False)
            metadata = reader.metadata or {}
            page_texts = [
                page.extract_text() or ''
                for page in reader.pages[:2]
            ]
            text = '\n'.join(page_texts)
    except Exception as error:
        logger.warning('Impossible de lire les métadonnées/texte du PDF %s : %s', path, error)

    author_from_text = _extract_author(text)
    author_from_metadata = _usable_metadata_value(
        metadata.get('/Author') or metadata.get('Author')
    )
    author = author_from_text or author_from_metadata
    if author:
        result['author_name'] = author[:255]
        result['author_full_name'] = author[:255]
        result['author_source'] = 'pdf_text_presented_by' if author_from_text else 'pdf_metadata'

    first_page_text = page_texts[0] if page_texts else ''
    title_from_text = (
        _extract_labeled_title(text)
        or _extract_title_after_date(first_page_text)
        or _extract_uppercase_title(first_page_text)
    )
    title_from_metadata = _usable_metadata_value(
        metadata.get('/Title') or metadata.get('Title')
    )
    title_from_filename = path.stem.replace('_', ' ').strip()
    title = title_from_text or title_from_metadata or title_from_filename
    if title:
        result['title'] = _clean_text(title, 500)
        result['title_source'] = (
            'pdf_text' if title_from_text
            else 'pdf_metadata' if title_from_metadata
            else 'filename'
        )

    return result
