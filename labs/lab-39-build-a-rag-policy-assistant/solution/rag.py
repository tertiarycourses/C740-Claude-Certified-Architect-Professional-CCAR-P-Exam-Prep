"""Northwind policy retrieval: heading-aware chunking, a pure-Python BM25 index and role-filtered top-k retrieval.
No embeddings service and no Claude call here: retrieval is plain code you can test on its own (uv run check_retrieval.py)."""
import math
import re
from collections import Counter
from pathlib import Path

POLICY_DIR = Path(__file__).parent / "policies"
ROLES = ("teller", "credit_officer", "hr_partner")
STOPWORDS = set("""a an and are as at be by can do does for from has have how i if in is it its may me my of on or our
should that the their them there this to us was we what when where which who whom why will with you your""".split())


def tokenize(text):
    """Lower-case word tokens with stopwords removed."""
    return [t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in STOPWORDS]


def parse_document(path):
    """Read one policy file: doc_id and title from the '# ' line, access from the 'Access:' line, then the body."""
    text = Path(path).read_text(encoding="utf-8")
    first = text.splitlines()[0].lstrip("# ").strip()
    doc_id, _, title = first.partition(" ")
    m = re.search(r"^Access:\s*(.+)$", text, flags=re.M)
    access = m.group(1).strip() if m else "all staff"
    return {"doc_id": doc_id, "title": title.strip(), "access": access, "text": text}


def heading_chunks(doc):
    """One chunk per '## ' section, carrying doc_id, title, section and access metadata."""
    chunks = []
    for n, part in enumerate(re.split(r"^## ", doc["text"], flags=re.M)[1:], start=1):
        heading, _, body = part.partition("\n")
        chunks.append({"chunk_id": f"{doc['doc_id']}#{n}", "doc_id": doc["doc_id"], "title": doc["title"],
                       "section": heading.strip(), "access": doc["access"], "text": body.strip()})
    return chunks


def load_chunks(folder=POLICY_DIR):
    """Load every policy in the folder and chunk it by heading."""
    chunks = []
    for path in sorted(Path(folder).glob("*.md")):
        chunks.extend(heading_chunks(parse_document(path)))
    return chunks


def can_read(role, chunk):
    """'all staff' documents are open to every role; a restricted document lists the roles that may read it."""
    access = chunk["access"].lower()
    return access == "all staff" or role in [a.strip() for a in access.split(",")]


class BM25:
    """Okapi BM25 over the chunks (k1=1.5, b=0.75). Each chunk is indexed as title + section + text."""

    def __init__(self, chunks, k1=1.5, b=0.75):
        self.chunks, self.k1, self.b = chunks, k1, b
        self.docs = [tokenize(f"{c['title']} {c['section'] or ''} {c['text']}") for c in chunks]
        self.tf = [Counter(d) for d in self.docs]
        self.avgdl = sum(len(d) for d in self.docs) / max(len(self.docs), 1)
        df = Counter(t for d in self.docs for t in set(d))
        n = len(self.docs)
        self.idf = {t: math.log(1 + (n - f + 0.5) / (f + 0.5)) for t, f in df.items()}

    def score(self, query_tokens, i):
        tf, dl, s = self.tf[i], len(self.docs[i]), 0.0
        for t in query_tokens:
            if t in tf:
                s += self.idf[t] * tf[t] * (self.k1 + 1) / (tf[t] + self.k1 * (1 - self.b + self.b * dl / self.avgdl))
        return s


_INDEX = {}


def get_index():
    if "heading" not in _INDEX:
        _INDEX["heading"] = BM25(load_chunks())
    return _INDEX["heading"]


def retrieve(query, role, k=4):
    """Top-k chunks for the query that this role may read, best first. The role filter runs BEFORE ranking,
    so a restricted chunk can never be returned. Chunks that match no query word are dropped."""
    if role not in ROLES:
        raise ValueError(f"unknown role {role!r}; use one of {ROLES}")
    index, q = get_index(), tokenize(query)
    scored = [(index.score(q, i), c) for i, c in enumerate(index.chunks) if can_read(role, c)]
    scored = [(s, c) for s, c in scored if s > 0]
    scored.sort(key=lambda sc: sc[0], reverse=True)
    return [dict(c, score=round(s, 3)) for s, c in scored[:k]]
