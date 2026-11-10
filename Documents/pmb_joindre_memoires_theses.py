#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pmb_joindre_memoires_theses.py  -  Rattache les mémoires et thèses du serveur aux notices PMB
=============================================================================================

NOMS DE FICHIERS GÉRÉS
    FASLH_MEM_BC_23_0004.pdf    FS_These_BC_23_0080.Pdf    FSE_MEM_BC23_1001.pdf  (et BC16_5531 pour les livres)
  La clé de correspondance est  FACULTÉ + TYPE (mémoire/thèse) + ANNÉE + NUMÉRO.
  Le numéro seul n'est PAS unique (FS_These_BC_23_0001 et FASLH_MEM_BC_23_0001 existent tous deux) :
  il n'y a donc jamais de rapprochement « par numéro seulement » ni « en ignorant l'année ».

DEUX FAÇONS DE TROUVER LA NOTICE D'UN FICHIER
  A. Par l'ancien lien de la notice (champ « lien ») qui contient le même nom de fichier.   [automatique]
  B. Par les métadonnées de archives_final.csv (titre + auteur) comparées à la notice PMB,
     pour les fichiers que la méthode A n'a pas rattachés.                      [--meta report|apply]
     Par défaut (report) ces rapprochements sont seulement listés dans meta_correspondances.csv ;
     avec --meta apply, seuls les rapprochements « certains » sont joints.

ÉTAPES
  1. Lecture des notices (export PMB -e, ou directement la base avec --from-db).
  2. Parcours des dossiers (MEMOIRES / THESES) et lecture de archives_final.csv (--archives).
  3. Mise en correspondance, rapports CSV  (SIMULATION par défaut : rien n'est modifié dans PMB).
  4. Avec --apply : jonction réelle dans PMB (+ journal et rollback.sql).

MODES (--mode)
  explnum-blob (défaut)  fichier stocké dans la base, comme l'ajout manuel d'un document numérique
  explnum-url            document numérique de type URL (fichier copié dans --publish-dir, servi par Apache)
  lien                   met à jour le champ « lien » de la notice

EXEMPLES
  # 1) Simulation seule, notices lues dans la base (aucune écriture)
  python3 pmb_joindre_memoires_theses.py -s ~/apps/portail_bu/Documents \
      --archives ~/apps/portail_bu/Documents/archives_final.csv \
      --pmb-config /var/www/html/pmb/includes/db_param.inc.php --from-db

  # 2) Application réelle (après sauvegarde de la base)
  python3 pmb_joindre_memoires_theses.py -s ~/apps/portail_bu/Documents \
      --archives ~/apps/portail_bu/Documents/archives_final.csv \
      --pmb-config /var/www/html/pmb/includes/db_param.inc.php --from-db --apply

  # 3) Avec un export PMB au lieu de la base
  python3 pmb_joindre_memoires_theses.py -s ~/apps/portail_bu/Documents -e export_notices.xls --archives archives_final.csv

SAUVEGARDE AVANT --apply :   mysqldump -u USER -p NOM_BASE > sauvegarde_pmb.sql
DÉPENDANCES : Python 3.8+ ; pour la base :  sudo apt install python3-pymysql
"""

import argparse
import csv
import getpass
import hashlib
import html
import math
import mimetypes
import os
import re
import shutil
import sys
import time
import unicodedata
import urllib.parse as up
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from difflib import SequenceMatcher, get_close_matches
from functools import lru_cache
from pathlib import Path

VERSION = "3.0"
DEFAULT_EXTS = "pdf,epub,djvu,mobi,doc,docx"
DEFAULT_OLD_HOSTS = "10.4.3.254"

# Code complet : [FACULTÉ]_[These|MEM]_BC_AA_NNNN  ou, sans préfixe, BCAA_NNNN
CODE_RE = re.compile(
    r"(?:(?P<pre>[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z][A-Za-z0-9]*)*?)_"
    r"(?P<typ>theses?|mem|memoires?)_)?"
    r"BC[\s_\-]*(?P<yy>\d{2})[\s_\-]*(?P<n>\d{1,5})(?!\d)", re.I)

# Fautes de frappe connues dans les préfixes (appliquées aux fichiers ET aux liens)
FAC_ALIAS = {"FASLH": "FALSH"}

STATUTS_OK = ("a_joindre", "partiel")

LIBELLES = {
    "a_joindre": "Fichier trouvé, prêt à joindre",
    "partiel": "Plusieurs fichiers attendus, certains seulement trouvés",
    "deja_joint": "Déjà joint dans PMB (rien à faire)",
    "ambigu": "Plusieurs fichiers différents possibles (à trancher)",
    "approx": "Seulement une correspondance approchante (à vérifier)",
    "introuvable": "Aucun fichier correspondant sur le serveur",
    "lien_vide": "La notice n'a pas d'ancien lien",
    "lien_pmb_interne": "Lien parasite vers une page PMB (catalog.php)",
    "lien_externe": "Lien vers un site externe (laissé tel quel)",
    "lien_illisible": "Ancien lien tronqué / illisible",
    "notice_absente": "Notice introuvable dans la base PMB",
}


# --------------------------------------------------------------------------- #
#  Outils généraux
# --------------------------------------------------------------------------- #
def S(x):
    """Texte sûr pour l'écriture CSV (noms de fichiers mal encodés)."""
    return str(x).encode("utf-8", "surrogateescape").decode("utf-8", "replace")


def log(msg=""):
    print(msg, flush=True)


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def norm_name(s):
    return re.sub(r"[^a-z0-9]+", "", strip_accents(s).lower())


def norm_text(s):
    return re.sub(r"[^a-z0-9]+", " ", strip_accents(s).lower()).strip()


def unquote_smart(s):
    try:
        return up.unquote(s, encoding="utf-8", errors="strict")
    except UnicodeDecodeError:
        return up.unquote(s, encoding="latin-1")


def human(n):
    n = float(n)
    for unit in ("o", "Ko", "Mo", "Go", "To"):
        if n < 1024 or unit == "To":
            return f"{n:.0f} {unit}" if unit == "o" else f"{n:.1f} {unit}"
        n /= 1024


def file_md5(path, bufsize=1 << 20):
    h = hashlib.md5()
    with open(path, "rb") as f:
        while True:
            b = f.read(bufsize)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


def make_code(pre, typ, yy, n):
    """Clé de correspondance : (faculté, type T/M, année sur 2 chiffres, numéro)."""
    fac = re.sub(r"[^A-Z0-9]+", "_", strip_accents(pre or "").upper()).strip("_")
    fac = FAC_ALIAS.get(fac, fac)
    t = ""
    if typ:
        t = "T" if strip_accents(typ).lower().startswith("th") else "M"
    return (fac, t, int(yy), int(n))


def code_from_match(m):
    return make_code(m.group("pre"), m.group("typ"), m.group("yy"), m.group("n"))


# --------------------------------------------------------------------------- #
#  Lecture des notices
# --------------------------------------------------------------------------- #
@dataclass
class Notice:
    id: int
    titre: str
    lien: str
    eformat: str
    auteurs: list = field(default_factory=list)


def _cell_text(c):
    return html.unescape(re.sub(r"<[^>]+>", "", c)).replace("\xa0", " ").strip()


def _read_text_guess(path):
    raw = Path(path).read_bytes()
    m = re.search(rb"charset=([A-Za-z0-9_\-]+)", raw[:4000])
    enc = m.group(1).decode() if m else "utf-8"
    if enc.lower() in ("iso-8859-1", "latin1", "latin-1", "iso8859-1"):
        enc = "cp1252"
    return raw.decode(enc, errors="replace")


def _parse_html_table(path):
    txt = _read_text_guess(path)
    heads = [_cell_text(t) for t in re.findall(r"<th[^>]*>(.*?)</th>", txt, re.S | re.I)]
    data = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", txt, re.S | re.I):
        cells = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S | re.I)
        data.append([_cell_text(c) for c in cells])
    if not heads and data:
        heads, data = data[0], data[1:]
    elif data and data[0] == heads:
        data = data[1:]
    return heads, data


def _parse_with_pandas(path):
    try:
        import pandas as pd
    except ImportError:
        sys.exit("Ce fichier n'est pas un export HTML : installez pandas "
                 "(pip install pandas xlrd openpyxl) ou réexportez depuis PMB.")
    if Path(path).suffix.lower() in (".csv", ".tsv", ".txt"):
        df = pd.read_csv(path, sep=None, engine="python", dtype=str, encoding="utf-8-sig")
    else:
        df = pd.read_excel(path, dtype=str)
    df = df.fillna("")
    return [str(c) for c in df.columns], df.values.tolist()


def load_notices_from_file(path):
    p = Path(path)
    if not p.is_file():
        sys.exit(f"Fichier introuvable : {path}")
    head = p.read_bytes()[:4096].lstrip().lower()
    if b"<table" in head or head.startswith((b"<html", b"<!doctype", b"<h1", b"<meta")):
        heads, rows = _parse_html_table(path)
    else:
        heads, rows = _parse_with_pandas(path)
    idx = {h.strip().lower(): i for i, h in enumerate(heads)}
    for need in ("notice_id", "lien"):
        if need not in idx:
            sys.exit(f"Colonne « {need} » absente du fichier. Colonnes lues : {heads[:15]} ...")
    aut_cols = [i for h, i in idx.items() if h.startswith(("aut_entree_", "aut_rejete_"))]

    def cell(r, name):
        i = idx.get(name)
        return str(r[i]).strip() if i is not None and i < len(r) else ""

    notices, ignores = [], 0
    for r in rows:
        nid = cell(r, "notice_id").lstrip("'").strip()
        if not nid.isdigit():
            ignores += 1
            continue
        auts = [str(r[i]).strip() for i in aut_cols if i < len(r) and str(r[i]).strip()]
        notices.append(Notice(int(nid), cell(r, "tit1"), cell(r, "lien"), cell(r, "eformat").lstrip("'"), auts))
    if ignores:
        log(f"  ({ignores} ligne(s) sans notice_id numérique ignorée(s))")
    return notices


# --------------------------------------------------------------------------- #
#  archives_final.csv  (titre / auteur de chaque fichier)
# --------------------------------------------------------------------------- #
_T_SRC = {"pdf_text", "filename", "pdf_metadata", ""}
_A_SRC = {"pdf_text_presented_by", "pdf_text", "pdf_metadata", ""}


@dataclass
class ArchRec:
    id: str
    path: str      # chemin relatif (MEMOIRES/FALSH/2023/xxx.pdf)
    type: str
    fac: str
    year: str
    title: str
    author: str
    title_source: str
    size: int


def load_archives(path):
    """Lit archives_final.csv en réparant les titres contenant des virgules non protégées
    (les colonnes sont alors décalées : on lit les 5 premières et les 5 dernières cellules)."""
    p = Path(path)
    if not p.is_file():
        sys.exit(f"Fichier archives introuvable : {path}")
    out, douteux = [], 0
    with open(p, encoding="utf-8-sig", newline="") as f:
        rd = csv.reader(f)
        next(rd, None)
        for r in rd:
            while r and r[-1].strip() == "":
                r.pop()
            if len(r) < 8:
                douteux += 1
                continue
            rid, rpath, typ, fac, year = [c.strip() for c in r[:5]]
            rest = r[5:]
            size = rest[-1].strip()
            if size.isdigit():
                rest = rest[:-1]
            else:
                size = "0"
            a_src = rest[-1].strip() if rest else ""
            t_src = rest[-2].strip() if len(rest) > 1 else ""
            if a_src in _A_SRC and t_src in _T_SRC:
                rest = rest[:-2]
            else:
                douteux += 1
                t_src = ""
            if len(rest) >= 3:
                a_full, a_name, title = rest[-1], rest[-2], ",".join(rest[:-2])
            else:
                a_full = a_name = ""
                title = ",".join(rest)
            title = re.sub(r"\s+", " ", re.sub(r",(?=\S)", ", ", title)).strip()
            out.append(ArchRec(rid, rpath.replace("\\", "/"), typ, fac, year, title,
                               re.sub(r"\s+", " ", (a_full or a_name)).strip(), t_src, int(size)))
    if douteux:
        log(f"  ({douteux} ligne(s) d'archives à structure douteuse)")
    return out


# --------------------------------------------------------------------------- #
#  Parcours du serveur
# --------------------------------------------------------------------------- #
@dataclass(eq=False)
class SFile:
    path: Path
    root: Path
    name: str
    size: int
    mtime: float
    code: tuple
    pure_code: bool
    nkey: str
    rel: str = ""

    @property
    def ext(self):
        return os.path.splitext(self.name)[1].lower().lstrip(".")


def scan_server(sources, exts):
    files = []
    for root in sources:
        root = Path(root).expanduser()
        if not root.is_dir():
            sys.exit(f"Dossier source introuvable : {root}")
        for dp, dns, fns in os.walk(root):
            dns[:] = sorted(d for d in dns if not d.startswith("."))
            for fn in sorted(fns):
                stem, ext = os.path.splitext(fn)
                if ext.lower().lstrip(".") not in exts:
                    continue
                full = Path(dp) / fn
                try:
                    st = full.stat()
                except OSError:
                    continue
                m = CODE_RE.search(stem)
                code = code_from_match(m) if m else None
                pure = bool(CODE_RE.fullmatch(stem.strip()))
                files.append(SFile(full, root, fn, st.st_size, st.st_mtime, code, pure, norm_name(fn),
                                   full.relative_to(root).as_posix()))
    return files


class Index:
    def __init__(self, files):
        self.files = files
        self.by_code = defaultdict(list)
        self.by_num = defaultdict(list)     # (fac, type, n) -> fichiers (suggestions seulement)
        self.by_name = defaultdict(list)
        self.by_lower = defaultdict(list)
        self.by_nkey = defaultdict(list)
        self.by_rel = {}
        for f in files:
            if f.code:
                self.by_code[f.code].append(f)
                self.by_num[(f.code[0], f.code[1], f.code[3])].append(f)
            self.by_name[f.name].append(f)
            self.by_lower[f.name.lower()].append(f)
            self.by_nkey[f.nkey].append(f)
            self.by_rel[f.rel.lower()] = f
        self.nkeys = list(self.by_nkey.keys())


# --------------------------------------------------------------------------- #
#  Analyse de l'ancien lien
# --------------------------------------------------------------------------- #
@dataclass
class Ref:
    kind: str    # 'code' ou 'name'
    key: object
    label: str


def parse_lien(lien, exts, old_hosts):
    raw = (lien or "").strip()
    if not raw:
        return "lien_vide", []
    dec = unquote_smart(raw)
    low = dec.lower()

    refs, seen = [], set()
    for m in CODE_RE.finditer(dec):
        k = code_from_match(m)
        if k not in seen:
            seen.add(k)
            refs.append(Ref("code", k, re.sub(r"\s+", "", m.group(0))))
    if refs:
        return "ok", refs

    if "catalog.php" in low or re.search(r"/pmb(/|$)", low):
        return "lien_pmb_interne", []

    ext_alt = "|".join(sorted(map(re.escape, exts), key=len, reverse=True))
    names = []
    for m in re.finditer(rf"([^/\\]+?\.(?:{ext_alt}))(?![A-Za-z0-9])", dec, re.I):
        nm = m.group(1).strip()
        if nm not in names:
            names.append(nm)
    if names:
        return "ok", [Ref("name", n, n) for n in names]

    if low.startswith(("http://", "https://")):
        host = up.urlparse(raw).netloc.lower()
        if not any(h in host for h in old_hosts):
            return "lien_externe", []
    return "lien_illisible", []


# --------------------------------------------------------------------------- #
#  Correspondance par nom / code
# --------------------------------------------------------------------------- #
@dataclass
class Match:
    status: str                 # trouve | ambigu | introuvable | approx
    file: SFile = None
    how: str = ""
    candidates: list = field(default_factory=list)
    suggestion: str = ""


def pick_among(cands, policy):
    if len(cands) == 1:
        return cands[0], "trouve", ""
    by_size = defaultdict(list)
    for c in cands:
        by_size[c.size].append(c)
    if len(by_size) == 1 and len({file_md5(c.path) for c in cands}) == 1:
        return max(cands, key=lambda c: c.mtime), "trouve", "doublon identique"
    if policy == "newest":
        return max(cands, key=lambda c: c.mtime), "trouve", "le plus récent"
    if policy == "largest":
        return max(cands, key=lambda c: c.size), "trouve", "le plus volumineux"
    return None, "ambigu", ""


def match_ref(ref, idx, args):
    if ref.kind == "code":
        fac, t, yy, n = ref.key
        cands = idx.by_code.get(ref.key, [])
        # lien du type « Livres_FS_These_BC... » : on retire les mots parasites en tête du préfixe
        parts = fac.split("_") if fac else []
        while not cands and len(parts) > 1:
            parts = parts[1:]
            cands = idx.by_code.get(("_".join(parts), t, yy, n), [])
        if not cands:
            autres = idx.by_num.get((fac, t, n), [])
            sug = " ; ".join(S(f.path) for f in autres[:3])
            return Match("introuvable", suggestion=("même faculté/type/numéro, autre année : " + sug) if sug else "")
        pures = [c for c in cands if c.pure_code]
        f, st, note = pick_among(pures or cands, args.ambiguous)
        return Match(st, f, "code" + (f" ({note})" if note else ""), cands)

    for how, table, key in (("nom_exact", idx.by_name, ref.key),
                            ("nom_sans_casse", idx.by_lower, ref.key.lower()),
                            ("nom_normalise", idx.by_nkey, norm_name(ref.key))):
        cands = table.get(key)
        if cands:
            f, st, note = pick_among(cands, args.ambiguous)
            return Match(st, f, how + (f" ({note})" if note else ""), cands)

    close = get_close_matches(norm_name(ref.key), idx.nkeys, n=1, cutoff=args.fuzzy_cutoff)
    if close:
        cands = idx.by_nkey[close[0]]
        if args.accept_fuzzy:
            f, st, note = pick_among(cands, args.ambiguous)
            return Match(st, f, "approx", cands, S(cands[0].path))
        return Match("approx", None, "approx", cands, S(cands[0].path))
    return Match("introuvable")


@dataclass
class Result:
    notice: Notice
    lien_status: str
    refs: list
    matches: list
    statut: str = ""
    files: list = field(default_factory=list)
    via: str = "lien"


def analyse(notice, idx, args, exts, old_hosts):
    lst, refs = parse_lien(notice.lien, exts, old_hosts)
    r = Result(notice, lst, refs, [])
    if lst != "ok":
        r.statut = lst
        return r
    for ref in refs:
        r.matches.append(match_ref(ref, idx, args))
    found = [m for m in r.matches if m.status == "trouve"]
    seen = set()
    for m in found:
        if m.file.path not in seen:
            seen.add(m.file.path)
            r.files.append(m.file)
    if found and len(found) == len(r.matches):
        r.statut = "a_joindre"
    elif found:
        r.statut = "partiel"
    elif any(m.status == "ambigu" for m in r.matches):
        r.statut = "ambigu"
    elif any(m.status == "approx" for m in r.matches):
        r.statut = "approx"
    else:
        r.statut = "introuvable"
    return r


# --------------------------------------------------------------------------- #
#  Correspondance par métadonnées (archives_final.csv  <->  notices)
# --------------------------------------------------------------------------- #
_STOP = set("dans pour avec sans entre vers cette cela leur leurs dont sont etre ainsi comme plus tres "
            "thesis these memoire theme case study analyse etude cadre from with that this their".split())


def _tokens(s):
    return {t for t in norm_text(s).split() if len(t) >= 4 and t not in _STOP}


def _author_tokens(s):
    return {t for t in norm_text(s).split() if len(t) >= 3 and t not in ("mme", "mlle", "madame", "mademoiselle",
                                                                        "monsieur", "dr", "pr")}


def meta_match(results, idx, archives, args):
    """Retourne (lignes de rapport, nb certains). Modifie `results` si --meta apply."""
    claimed = {f.path for r in results if r.statut in STATUTS_OK or r.statut == "deja_joint" for f in r.files}
    by_rel = idx.by_rel
    cibles = [r for r in results if r.statut not in STATUTS_OK]
    inv = defaultdict(list)
    ntok, ntit = {}, {}
    for pos, r in enumerate(cibles):
        tk = _tokens(r.notice.titre)
        ntok[pos], ntit[pos] = tk, norm_text(r.notice.titre)
        for t in tk:
            inv[t].append(pos)

    proposals = []   # (rec, file, pos, ratio, a_ok)
    rows_sans = []
    for rec in archives:
        f = by_rel.get(rec.path.lower())
        if f is None or f.path in claimed:
            continue
        if rec.title_source == "filename" or len(rec.title) < 15:
            rows_sans.append((rec, f, "titre_peu_fiable"))
            continue
        ftk, ftit = _tokens(rec.title), norm_text(rec.title)
        if len(ftk) < 3:
            rows_sans.append((rec, f, "titre_peu_fiable"))
            continue
        cnt = Counter()
        for t in ftk:
            post = inv.get(t)
            if post and len(post) < 400:
                cnt.update(post)
        cands = []
        for pos, c in cnt.most_common(12):
            if c < max(3, math.ceil(0.5 * min(len(ftk), len(ntok[pos])))):
                continue
            a, b = ftit[:260], ntit[pos][:260]
            ratio = SequenceMatcher(None, a, b).ratio()
            short, long_ = (a, b) if len(a) <= len(b) else (b, a)
            if len(short) >= 30 and short in long_:
                ratio = max(ratio, 0.96)
            if ratio >= args.meta_min:
                cands.append((ratio, pos))
        if not cands:
            rows_sans.append((rec, f, "aucune_notice_proche"))
            continue
        cands.sort(reverse=True)
        ratio, pos = cands[0]
        unique = len(cands) == 1 or cands[1][0] < ratio - 0.04
        fa = _author_tokens(rec.author)
        na = set()
        for a in cibles[pos].notice.auteurs:
            na |= _author_tokens(a)
        a_ok = bool(fa & na)
        proposals.append([rec, f, pos, ratio, a_ok, unique])

    par_notice = Counter(p[2] for p in proposals)
    rows, nb_certains = [], 0
    for rec, f, pos, ratio, a_ok, unique in proposals:
        r = cibles[pos]
        certain = ratio >= args.meta_certain and a_ok and unique and par_notice[pos] == 1
        classe = "certain" if certain else "a_verifier"
        rows.append([rec.id, f.rel, rec.title, rec.author, r.notice.id, r.notice.titre,
                     " ; ".join(r.notice.auteurs), f"{ratio:.2f}", "oui" if a_ok else "non",
                     "oui" if unique else "non", classe])
        if certain:
            nb_certains += 1
            if args.meta == "apply":
                r.statut, r.files, r.via = "a_joindre", [f], "metadonnees"
                r.refs = [Ref("meta", rec.id, f"meta:{rec.id}")]
                r.matches = [Match("trouve", f, f"metadonnees (titre {ratio:.2f})", [f])]
    for rec, f, raison in rows_sans:
        rows.append([rec.id, f.rel, rec.title, rec.author, "", "", "", "", "", "", raison])
    return rows, nb_certains


# --------------------------------------------------------------------------- #
#  URL / publication des fichiers (modes lien et explnum-url)
# --------------------------------------------------------------------------- #
def rel_parts(f, multi_root):
    parts = list(f.path.relative_to(f.root).parts)
    return ([f.root.name] + parts) if multi_root else parts


def plan_url(f, args, multi_root):
    parts = rel_parts(f, multi_root)
    url = args.base_url.rstrip("/") + "/" + "/".join(up.quote(p) for p in parts)
    dest = Path(args.publish_dir).joinpath(*parts) if args.publish_dir else None
    return url, dest


def publish_file(f, dest, how):
    if dest is None:
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() or dest.is_symlink():
        if how == "copy" and dest.is_file() and dest.stat().st_size == f.size:
            return
        dest.unlink()
    if how == "symlink":
        os.symlink(f.path.resolve(), dest)
    else:
        shutil.copy2(f.path, dest)
        os.chmod(dest, 0o644)


# --------------------------------------------------------------------------- #
#  Base de données
# --------------------------------------------------------------------------- #
def read_pmb_config(path):
    txt = Path(path).read_text(errors="replace")

    def g(name):
        m = re.search(r"\$" + name + r"\s*=\s*['\"]([^'\"]*)['\"]", txt)
        return m.group(1) if m else None

    return {"host": g("SQL_SERVER"), "user": g("USER_NAME"), "password": g("USER_PASS"), "db": g("DBNom")}


def connect(args):
    try:
        import pymysql
        import pymysql.cursors
    except ImportError:
        sys.exit("Module manquant : sudo apt install python3-pymysql   (ou pip install pymysql)")
    cfg = {"host": "localhost", "user": None, "password": None, "db": None}
    if args.pmb_config:
        cfg.update({k: v for k, v in read_pmb_config(args.pmb_config).items() if v})
    for k, a in (("host", args.db_host), ("user", args.db_user), ("password", args.db_password), ("db", args.db_name)):
        if a:
            cfg[k] = a
    if cfg["password"] is None:
        cfg["password"] = os.environ.get("PMB_DB_PASS") or getpass.getpass("Mot de passe MySQL : ")
    if not cfg["user"] or not cfg["db"]:
        sys.exit("Paramètres base manquants : utilisez --pmb-config ou --db-user/--db-name.")
    return pymysql.connect(host=cfg["host"], port=args.db_port, user=cfg["user"], password=cfg["password"],
                           database=cfg["db"], charset=args.db_charset, autocommit=False,
                           cursorclass=pymysql.cursors.DictCursor)


def chunks(seq, n):
    for i in range(0, len(seq), n):
        yield seq[i:i + n]


def sql_identifier(name):
    if not re.fullmatch(r"[A-Za-z0-9_]+", name):
        raise ValueError("Nom de table invalide")
    return "`" + name.replace("`", "``") + "`"


def table_columns(cur, table):
    cur.execute("SHOW COLUMNS FROM " + sql_identifier(table))
    return {r["Field"]: r for r in cur.fetchall()}


def fill_required(cols, row):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for name, c in cols.items():
        if name in row or "auto_increment" in (c.get("Extra") or "").lower():
            continue
        if c["Null"] == "NO" and c["Default"] is None:
            t = c["Type"].lower()
            if re.match(r"(tiny|small|medium|big)?int|decimal|numeric|float|double|year", t):
                row[name] = 0
            elif "blob" in t or "binary" in t:
                row[name] = b""
            elif t.startswith(("date", "timestamp")):
                row[name] = now
            else:
                row[name] = ""
    return row


def db_load_notices(args, with_authors):
    """with_authors=True : toutes les notices + auteurs (pour le rapprochement par métadonnées)."""
    conn = connect(args)
    cur = conn.cursor()
    if with_authors:
        query = "SELECT notice_id, tit1, lien, eformat FROM notices"
        params = ()
    else:
        query = "SELECT notice_id, tit1, lien, eformat FROM notices WHERE lien IS NOT NULL AND lien <> ''"
        params = ()
    cur.execute(query, params)
    notices = {int(r["notice_id"]): Notice(int(r["notice_id"]), r["tit1"] or "", r["lien"] or "", r["eformat"] or "")
               for r in cur.fetchall()}
    if with_authors:
        cur.execute("SELECT r.responsability_notice AS nid, a.author_name AS nom, a.author_rejete AS prenom "
                    "FROM responsability r JOIN authors a ON a.author_id = r.responsability_author")
        for row in cur.fetchall():
            n = notices.get(int(row["nid"]))
            if n is not None:
                n.auteurs.append(f"{row['prenom'] or ''} {row['nom'] or ''}".strip())
    conn.close()
    return list(notices.values())


def db_enrich(cur, results, mode, args, multi_root):
    ids = [r.notice.id for r in results if r.statut in STATUTS_OK]
    notices = {}
    notice_query = ("SELECT notice_id, lien, eformat FROM notices WHERE notice_id IN (" +
                    ",".join(["%s"] * 1000) + ")")
    for ch in chunks(ids, 1000):
        cur.execute(notice_query, ch + [None] * (1000 - len(ch)))
        for row in cur.fetchall():
            notices[row["notice_id"]] = row
    attached = defaultdict(set)
    if mode != "lien":
        for ch in chunks(ids, 1000):
            cur.execute("SELECT explnum_notice, explnum_nom, explnum_nomfichier, explnum_url FROM explnum "
                        "WHERE explnum_notice IN (%s)" % ",".join(["%s"] * len(ch)), ch)
            for row in cur.fetchall():
                for v in (row["explnum_nom"], row["explnum_nomfichier"],
                          unquote_smart((row["explnum_url"] or "").rsplit("/", 1)[-1])):
                    if v:
                        attached[row["explnum_notice"]].add(str(v).lower())
    for r in results:
        if r.statut not in STATUTS_OK:
            continue
        if r.notice.id not in notices:
            r.statut, r.files = "notice_absente", []
            continue
        if mode == "lien":
            url, _ = plan_url(r.files[0], args, multi_root)
            if (notices[r.notice.id]["lien"] or "") == url:
                r.statut, r.files = "deja_joint", []
        else:
            deja = attached.get(r.notice.id, set())
            restants = [f for f in r.files if f.name.lower() not in deja]
            if not restants:
                r.statut, r.files = "deja_joint", []
            else:
                r.files = restants


# --------------------------------------------------------------------------- #
#  Rapports
# --------------------------------------------------------------------------- #
def write_csv(path, header, rows):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";", quoting=csv.QUOTE_MINIMAL)
        w.writerow(header)
        for r in rows:
            w.writerow([S(x) for x in r])


def write_reports(results, idx, archives, meta_rows, outdir, args, multi_root):
    header = ["notice_id", "titre", "statut", "explication", "methode", "ancien_lien", "reference_extraite",
              "type_correspondance", "fichier_serveur", "taille", "url_prevue", "candidats_ou_suggestion"]
    rows, used = [], set()
    for r in results:
        for m in r.matches:
            for c in m.candidates:
                used.add(c.path)
            if m.file:
                used.add(m.file.path)
        if r.statut == "lien_vide" and not args.report_all:
            continue
        refs = " | ".join(x.label for x in r.refs)
        hows = " | ".join(m.how or m.status for m in r.matches)
        files = " | ".join(S(f.path) for f in r.files) if r.files else " | ".join(
            S(m.file.path) for m in r.matches if m.file)
        size = " | ".join(human(f.size) for f in r.files)
        urls = ""
        if args.mode in ("lien", "explnum-url") and args.base_url and r.files:
            urls = " | ".join(plan_url(f, args, multi_root)[0] for f in r.files)
        extra = []
        for m in r.matches:
            if m.status in ("ambigu", "approx") and m.candidates:
                extra.append(" ; ".join(S(c.path) for c in m.candidates[:4]))
            elif m.suggestion:
                extra.append(m.suggestion)
        rows.append([r.notice.id, r.notice.titre, r.statut, LIBELLES.get(r.statut, ""), r.via,
                     r.notice.lien, refs, hows, files, size, urls, " || ".join(extra)])
    write_csv(outdir / "correspondances.csv", header, rows)
    write_csv(outdir / "anomalies.csv", header, [x for x in rows if x[2] not in ("a_joindre", "deja_joint")])
    orphelins = [[S(f.rel), human(f.size), datetime.fromtimestamp(f.mtime).strftime("%Y-%m-%d")]
                 for f in idx.files if f.path not in used and not any(
                     f.path == g.path for r in results if r.statut in STATUTS_OK + ("deja_joint",) for g in r.files)]
    write_csv(outdir / "fichiers_orphelins.csv", ["fichier", "taille", "date_modif"], orphelins)
    if meta_rows is not None:
        write_csv(outdir / "meta_correspondances.csv",
                  ["id_archive", "fichier", "titre_archive", "auteur_archive", "notice_id", "titre_notice",
                   "auteurs_notice", "similarite_titre", "auteur_concordant", "unique", "classe"], meta_rows)
    manquants = []
    if archives:
        manquants = [[a.id, a.path, a.title] for a in archives if a.path.lower() not in idx.by_rel]
        write_csv(outdir / "archives_sans_fichier.csv", ["id_archive", "chemin_attendu", "titre"], manquants)
    return len(orphelins), len(manquants)


def summary(results, idx, nb_orph, nb_manq, meta_rows, nb_certains, archives, args):
    c = Counter(r.statut for r in results)
    lines = ["", "=" * 70, f"RÉSUMÉ  (mode : {args.mode})", "=" * 70,
             f"Notices analysées                 : {len(results)}",
             f"Fichiers indexés sur le serveur   : {len(idx.files)}"]
    for k in ("a_joindre", "partiel", "deja_joint", "ambigu", "approx", "introuvable", "lien_vide",
              "lien_pmb_interne", "lien_externe", "lien_illisible", "notice_absente"):
        if c.get(k):
            lines.append(f"  {k:<18} {c[k]:>6}   {LIBELLES[k]}")
    via = Counter(r.via for r in results if r.statut in STATUTS_OK)
    if via:
        lines.append("  dont par ancien lien : %d   par métadonnées : %d" % (via.get("lien", 0), via.get("metadonnees", 0)))
    if meta_rows is not None:
        prop = sum(1 for m in meta_rows if m[4] != "")
        lines += ["", f"Rapprochement par métadonnées     : {prop} proposition(s), dont {nb_certains} certaine(s)"
                      f"  ({'APPLIQUÉES' if args.meta == 'apply' else 'rapport seulement : --meta apply pour les joindre'})"]
    todo = {f.path: f for r in results if r.statut in STATUTS_OK for f in r.files}
    n_att = sum(len(r.files) for r in results if r.statut in STATUTS_OK)
    lines += ["", f"Rattachements à effectuer         : {n_att} (pour {len(todo)} fichiers distincts)",
              f"Volume des fichiers concernés     : {human(sum(f.size for f in todo.values()))}"]
    if args.mode == "explnum-blob":
        lines.append("  (ce volume sera stocké DANS la base MySQL : vérifiez l'espace disque)")
    lines.append(f"Fichiers serveur sans notice      : {nb_orph}  (fichiers_orphelins.csv)")
    if archives:
        lines.append(f"Lignes d'archives sans fichier    : {nb_manq}  (archives_sans_fichier.csv)")
    return "\n".join(lines)


# --------------------------------------------------------------------------- #
#  Application dans PMB
# --------------------------------------------------------------------------- #
def apply_changes(results, args, outdir, multi_root):
    from pymysql.converters import escape_string

    conn = connect(args)
    cur = conn.cursor()
    cur.execute("SELECT @@max_allowed_packet AS m")
    max_packet = int(cur.fetchone()["m"])
    cols = table_columns(cur, "explnum") if args.mode != "lien" else {}

    journal = open(outdir / "journal_apply.csv", "w", newline="", encoding="utf-8-sig")
    jw = csv.writer(journal, delimiter=";")
    jw.writerow(["heure", "notice_id", "fichier", "action", "detail"])
    rollback = open(outdir / "rollback.sql", "w", encoding="utf-8")
    rollback.write("-- Annulation des modifications faites par pmb_joindre_memoires_theses.py\n")
    rollback.write("-- À exécuter avec :  mysql -u USER -p NOM_BASE < rollback.sql\n")
    backup = bw = None
    if args.mode == "lien":
        backup = open(outdir / "sauvegarde_notices.csv", "w", newline="", encoding="utf-8-sig")
        bw = csv.writer(backup, delimiter=";")
        bw.writerow(["notice_id", "ancien_lien", "ancien_eformat"])

    todo = [r for r in results if r.statut in STATUTS_OK and r.files]
    stats = Counter()
    t0 = time.time()

    def jlog(nid, f, action, detail=""):
        jw.writerow([datetime.now().strftime("%H:%M:%S"), nid, S(f.name if f else ""), action, S(detail)])
        journal.flush()

    for i, r in enumerate(todo, 1):
        nid = r.notice.id
        try:
            conn.ping(reconnect=True)
            if args.mode == "lien":
                f = r.files[0]
                url, dest = plan_url(f, args, multi_root)
                publish_file(f, dest, args.publish_mode)
                cur.execute("SELECT lien, eformat FROM notices WHERE notice_id=%s", (nid,))
                old = cur.fetchone()
                bw.writerow([nid, S(old["lien"] or ""), S(old["eformat"] or "")])
                cur.execute("UPDATE notices SET lien=%s, eformat=%s WHERE notice_id=%s", (url, f.ext, nid))
                conn.commit()
                rollback.write("UPDATE notices SET lien='%s', eformat='%s' WHERE notice_id=%d;\n" % (
                    escape_string(old["lien"] or ""), escape_string(old["eformat"] or ""), nid))
                rollback.flush()
                stats["lien_maj"] += 1
                jlog(nid, f, "lien_maj", url + ("" if len(r.files) == 1 else f"  (autres fichiers ignorés : {len(r.files) - 1})"))
                continue

            for f in r.files:
                mime = "URL" if args.mode == "explnum-url" else (mimetypes.guess_type(f.name)[0] or "application/octet-stream")
                now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                vals = {"explnum_notice": nid, "explnum_bulletin": 0, "explnum_nom": f.name,
                        "explnum_mimetype": mime, "explnum_url": "", "explnum_extfichier": f.ext,
                        "explnum_nomfichier": f.name, "explnum_statut": 0, "explnum_repertoire": 0,
                        "explnum_path": "", "explnum_docnum_statut": 1, "explnum_create_date": now,
                        "explnum_update_date": now, "explnum_file_size": f.size}
                if args.mode == "explnum-url":
                    url, dest = plan_url(f, args, multi_root)
                    publish_file(f, dest, args.publish_mode)
                    vals["explnum_url"] = url
                else:
                    if f.size > max_packet - 65536:
                        stats["trop_volumineux"] += 1
                        jlog(nid, f, "ignore_trop_volumineux",
                             f"{human(f.size)} > max_allowed_packet ({human(max_packet)}) : "
                             "augmentez-le (SET GLOBAL max_allowed_packet=268435456) ou utilisez --mode explnum-url")
                        continue
                    vals["explnum_data"] = f.path.read_bytes()
                row = fill_required(cols, {k: v for k, v in vals.items() if k in cols})
                names = list(row.keys())
                if not all(re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", n) for n in names):
                    raise ValueError("Nom de colonne explnum invalide")
                columns_sql = ",".join(f"`{n}`" for n in names)
                placeholders = ",".join(["%s"] * len(names))
                cur.execute(
                    f"INSERT INTO `explnum` ({columns_sql}) VALUES ({placeholders})",
                    [row[n] for n in names],
                )
                new_id = cur.lastrowid
                conn.commit()
                rollback.write(f"DELETE FROM explnum WHERE explnum_id={new_id};\n")
                rollback.flush()
                stats["explnum_ajoute"] += 1
                jlog(nid, f, "explnum_ajoute", f"explnum_id={new_id} ({r.via})")
        except Exception as e:  # noqa: BLE001
            try:
                conn.rollback()
            except Exception:
                pass
            stats["erreurs"] += 1
            jlog(nid, r.files[0] if r.files else None, "ERREUR", repr(e))
            log(f"  ! notice {nid} : {e!r}")
        if i % 100 == 0 or i == len(todo):
            log(f"  {i}/{len(todo)} notices traitées ({time.time() - t0:.0f}s)")

    for fh in (journal, rollback, backup):
        if fh:
            fh.close()
    conn.close()
    return stats


# --------------------------------------------------------------------------- #
#  Programme principal
# --------------------------------------------------------------------------- #
def parse_args():
    p = argparse.ArgumentParser(description="Joint les mémoires et thèses du serveur aux notices PMB.",
                                formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    p.add_argument("-s", "--source", action="append", required=True, metavar="DOSSIER",
                   help="Dossier à parcourir (répétable). Conseillé : le dossier parent de MEMOIRES et THESES.")
    p.add_argument("-e", "--excel", default="tableau.xls", help="Export PMB (HTML déguisé en .xls, .xlsx ou .csv).")
    p.add_argument("--from-db", action="store_true", help="Lire les notices directement dans la base PMB.")
    p.add_argument("--archives", help="archives_final.csv (titre/auteur par fichier) : active le rapprochement par métadonnées.")
    p.add_argument("--meta", choices=("off", "report", "apply"), default="report",
                   help="Rapprochement par métadonnées : report = lister seulement, apply = joindre les « certains ».")
    p.add_argument("--meta-min", type=float, default=0.80, help="Similarité minimale de titre pour proposer.")
    p.add_argument("--meta-certain", type=float, default=0.93, help="Similarité de titre pour être « certain » (avec auteur concordant).")
    p.add_argument("--mode", choices=("explnum-blob", "explnum-url", "lien"), default="explnum-blob")
    p.add_argument("--apply", action="store_true", help="Écrire réellement dans PMB (sinon simulation).")
    p.add_argument("--yes", action="store_true", help="Ne pas demander de confirmation avec --apply.")
    p.add_argument("--check-db", action="store_true", help="Simulation + contrôle dans la base (notices existantes, déjà jointes).")
    p.add_argument("-o", "--out-dir", default=None, help="Dossier des rapports.")
    p.add_argument("--ext", default=DEFAULT_EXTS, help="Extensions de fichiers considérées.")
    p.add_argument("--old-hosts", default=DEFAULT_OLD_HOSTS, help="Hôtes de l'ancien serveur (séparés par des virgules).")
    p.add_argument("--alias", action="append", default=[], metavar="FAUX=BON",
                   help="Correspondance de préfixes (défaut intégré : FASLH=FALSH). Répétable.")
    p.add_argument("--ambiguous", choices=("skip", "newest", "largest"), default="skip",
                   help="Si plusieurs fichiers DIFFÉRENTS portent le même code.")
    p.add_argument("--accept-fuzzy", action="store_true", help="Accepter les noms approchants (liens sans code).")
    p.add_argument("--fuzzy-cutoff", type=float, default=0.85)
    p.add_argument("--limit", type=int, default=0, help="Ne traiter que les N premières notices (test).")
    p.add_argument("--report-all", action="store_true", help="Lister aussi les notices sans lien dans les rapports.")
    g = p.add_argument_group("URL / publication (modes explnum-url et lien)")
    g.add_argument("--base-url", help="Ex : http://bcuy1/documents")
    g.add_argument("--publish-dir", help="Dossier servi par Apache où copier les fichiers.")
    g.add_argument("--publish-mode", choices=("copy", "symlink"), default="copy")
    d = p.add_argument_group("Base de données")
    d.add_argument("--pmb-config", help="includes/db_param.inc.php de PMB.")
    d.add_argument("--db-host")
    d.add_argument("--db-port", type=int, default=3306)
    d.add_argument("--db-user")
    d.add_argument("--db-password", help="Sinon variable PMB_DB_PASS ou saisie au clavier.")
    d.add_argument("--db-name")
    d.add_argument("--db-charset", default="utf8")
    args = p.parse_args()
    if args.mode in ("lien", "explnum-url") and not args.base_url:
        p.error(f"--base-url est obligatoire avec --mode {args.mode}")
    if args.apply and args.meta == "apply" and not args.archives:
        p.error("--meta apply nécessite --archives")
    return args


def main():
    args = parse_args()
    for a in args.alias:
        if "=" in a:
            k, v = a.split("=", 1)
            FAC_ALIAS[k.strip().upper()] = v.strip().upper()
    exts = tuple(e.strip().lower().lstrip(".") for e in args.ext.split(",") if e.strip())
    old_hosts = tuple(h.strip().lower() for h in args.old_hosts.split(",") if h.strip())
    multi_root = len(args.source) > 1
    use_meta = bool(args.archives) and args.meta != "off"
    outdir = Path(args.out_dir or f"rapport_memoires_{datetime.now():%Y%m%d_%H%M%S}")
    outdir.mkdir(parents=True, exist_ok=True)

    log(f"pmb_joindre_memoires_theses v{VERSION} - mode {args.mode} - {'APPLICATION' if args.apply else 'simulation'}")
    log("1/4 Lecture des notices ...")
    notices = db_load_notices(args, with_authors=use_meta) if args.from_db else load_notices_from_file(args.excel)
    if args.limit:
        notices = notices[:args.limit]
    log(f"    {len(notices)} notices")

    log("2/4 Parcours du serveur et lecture des archives ...")
    files = scan_server(args.source, exts)
    idx = Index(files)
    log(f"    {len(files)} fichiers ({human(sum(f.size for f in files))})")
    if not files:
        sys.exit("Aucun fichier trouvé dans les dossiers sources (extensions : %s)." % ",".join(exts))
    archives = load_archives(args.archives) if args.archives else None
    if archives is not None:
        log(f"    {len(archives)} lignes dans archives_final.csv")

    log("3/4 Mise en correspondance ...")
    results = [analyse(n, idx, args, exts, old_hosts) for n in notices]
    meta_rows, nb_certains = None, 0
    if use_meta:
        meta_rows, nb_certains = meta_match(results, idx, archives, args)

    if args.check_db or args.apply:
        log("    Contrôle dans la base PMB ...")
        conn = connect(args)
        db_enrich(conn.cursor(), results, args.mode, args, multi_root)
        conn.close()

    nb_orph, nb_manq = write_reports(results, idx, archives, meta_rows, outdir, args, multi_root)
    text = summary(results, idx, nb_orph, nb_manq, meta_rows, nb_certains, archives, args)
    (outdir / "resume.txt").write_text(text, encoding="utf-8")
    log(text)
    log(f"\nRapports : {outdir.resolve()}")

    if not args.apply:
        log("\nSimulation terminée : rien n'a été modifié. Relisez correspondances.csv, anomalies.csv")
        log("et meta_correspondances.csv, puis relancez avec --apply.")
        return

    n = sum(len(r.files) for r in results if r.statut in STATUTS_OK)
    if n == 0:
        log("\nRien à joindre.")
        return
    if not args.yes:
        rep = input(f"\n{n} rattachement(s) vont être écrits dans PMB (mode {args.mode}). "
                    "Avez-vous sauvegardé la base ? Tapez OUI pour continuer : ")
        if rep.strip().upper() != "OUI":
            sys.exit("Annulé.")
    log("4/4 Écriture dans PMB ...")
    stats = apply_changes(results, args, outdir, multi_root)
    log("\nTerminé : " + ", ".join(f"{k}={v}" for k, v in sorted(stats.items())))
    log(f"Journal : {outdir / 'journal_apply.csv'}   |   Annulation : {outdir / 'rollback.sql'}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("\nInterrompu.")
