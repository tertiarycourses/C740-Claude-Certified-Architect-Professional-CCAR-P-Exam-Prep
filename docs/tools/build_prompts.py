"""Build the Day 2 prompt pages (Labs 39-41) from each lab's README.md, the single source of truth.

For every lab in docs/data/day2.json it writes two identical files:
  labs/<slug>/prompts.html   (in the lab folder, works offline)
  docs/lab-NN.html           (the GitHub Pages copy)
Every ```text block becomes a prompt card with a Copy button, every ```bash block a dark terminal-command card with
its own Copy button, and every other fenced block plain preformatted text. Same page style as the house prompt-page.

Usage (from the repo root):
  python3 docs/tools/build_prompts.py           write the pages
  python3 docs/tools/build_prompts.py --check   exit 1 if any page is out of date with its README"""
import html
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
COURSE = "Claude Certified Architect - Professional (CCAR-P) Exam Prep"
PAGES = "https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/"
GH = "https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/"
LABS = {d["id"]: d["slug"] for d in json.loads((REPO / "docs/data/day2.json").read_text())}

STYLE = """:root{--cream:#FAF9F5;--ink:#21201C;--grey:#5F5C56;--orange:#C9603A;--teal:#2F6F6D;--line:#D9D4C8;--sand:#F6EEDD;--mint:#E3F1F0;--side:#F2EFE7}
*{box-sizing:border-box} body{margin:0;background:var(--cream);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
nav{position:sticky;top:0;z-index:5;background:var(--side);border-bottom:1px solid var(--line);padding:8px 16px;display:flex;gap:6px;flex-wrap:wrap;font-size:13.5px}
nav span{color:var(--line);padding:3px 2px} nav a[aria-current]{background:var(--mint);font-weight:700}
nav a{color:var(--teal);text-decoration:none;padding:3px 8px;border-radius:6px} nav a:hover,nav a:focus{background:var(--mint);outline:none}
nav .home{font-weight:700;color:var(--orange)}
main{max-width:920px;margin:0 auto;padding:24px 20px 80px}
h1{font-size:30px;line-height:1.2;margin:10px 0 6px} h2{color:var(--orange);margin:38px 0 8px;font-size:22px;scroll-margin-top:56px} h3{margin:22px 0 6px;font-size:17px}
a{color:var(--teal)} code{font:13.5px ui-monospace,Menlo,Consolas,monospace;background:var(--sand);padding:1px 5px;border-radius:4px}
.links{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0} .links a{border:1px solid var(--teal);border-radius:8px;padding:6px 12px;text-decoration:none;font-size:14px}
.note{color:var(--grey);border-left:3px solid var(--line);padding-left:12px} .check{background:var(--mint);border-radius:8px;padding:10px 14px}
.tw{overflow-x:auto} table{border-collapse:collapse;width:100%;font-size:14.5px} th{text-align:left;border-bottom:2px solid var(--orange)} th,td{padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
pre{margin:0;white-space:pre-wrap;word-break:break-word;font:13.5px/1.5 ui-monospace,Menlo,Consolas,monospace;padding:14px}
pre.plain{background:#fff;border:1px solid var(--line);border-radius:8px;white-space:pre;overflow-x:auto}
.prompt{border:1px solid var(--teal);border-radius:10px;background:#fff;margin:10px 0 14px;overflow:hidden}
.bar{display:flex;justify-content:space-between;align-items:center;gap:10px;background:var(--mint);padding:6px 10px;font-size:13px;color:var(--grey)}
.copy{font:600 13.5px system-ui,sans-serif;background:var(--teal);color:#fff;border:0;border-radius:7px;padding:7px 14px;cursor:pointer}
.cmd{border-color:var(--ink)} .cmd .bar{background:#2B2A26;color:#E8E4DA} .cmd pre{background:#21201C;color:#F4F1EA}
.cmd .copy{background:var(--orange)} .cmd .copy:hover{background:#a94f2f}
.powered-by{text-align:center;color:var(--grey);font-size:13px;padding:18px 16px 28px;border-top:1px solid var(--line)}
.copy:hover{background:#24585a} .copy:focus-visible{outline:3px solid var(--orange);outline-offset:2px} .copy.done{background:var(--orange)}"""

SCRIPT = """function fallbackCopy(text){const t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(t);return ok}
document.querySelectorAll('.copy').forEach(b=>{b.dataset.label=b.textContent;b.addEventListener('click',async()=>{
  const text=document.getElementById(b.dataset.for).innerText; let ok=false;
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);ok=true}}catch(e){}
  if(!ok) ok=fallbackCopy(text);
  b.textContent=ok?'Copied ✓':'Press Ctrl+C'; b.classList.add('done');
  if(!ok){const r=document.createRange();r.selectNodeContents(document.getElementById(b.dataset.for));const s=getSelection();s.removeAllRanges();s.addRange(r)}
  setTimeout(()=>{b.textContent=b.dataset.label;b.classList.remove('done')},1800);
})});"""


def inline(t):
    """Inline Markdown: `code`, **bold**, [text](url) and bare URLs. Everything else is escaped."""
    codes = []
    t = re.sub(r"`([^`]+)`", lambda m: codes.append(m.group(1)) or f"\x00{len(codes) - 1}\x00", t)
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', t)
    t = re.sub(r"(?<![\"'>=])(https?://[^\s<)]+[^\s<).,])", r'<a href="\1">\1</a>', t)
    return re.sub(r"\x00(\d+)\x00", lambda m: f"<code>{html.escape(codes[int(m.group(1))])}</code>", t)


def convert(md):
    """The README body as HTML. Returns (html, section nav entries, number of prompts, number of commands)."""
    lines, out, nav, i, n_prompt, n_cmd = md.splitlines(), [], [], 0, 0, 0
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("```"):
            lang, buf = ln[3:].strip(), []
            i += 1
            while not lines[i].startswith("```"):
                buf.append(lines[i])
                i += 1
            body = html.escape("\n".join(buf))
            if lang == "bash":       # a command the learner runs: never inside a prompt
                n_cmd += 1
                out.append(f'<div class="prompt cmd"><div class="bar"><span>Terminal</span><button type="button" '
                           f'class="copy" data-for="c{n_cmd}">Copy command</button></div><pre id="c{n_cmd}">{body}</pre></div>')
            elif lang == "text":     # a prompt the learner pastes into the AI coding tool
                n_prompt += 1
                out.append(f'<div class="prompt"><div class="bar"><span>Paste into your AI coding tool\'s chat</span>'
                           f'<button type="button" class="copy" data-for="p{n_prompt}">Copy prompt</button></div>'
                           f'<pre id="p{n_prompt}">{body}</pre></div>')
            else:
                out.append(f'<pre class="plain">{body}</pre>')
        elif ln.startswith("# "):
            out.append(f"<h1>{inline(ln[2:])}</h1>")
        elif ln.startswith("## "):
            sid = re.sub(r"[^a-z0-9]+", "-", ln[3:].lower()).strip("-")
            label = re.sub(r"\s*\(.*?\)", "", ln[3:]).split(" · ")[0]
            if label.startswith(("Step", "Before", "Stretch", "Troubleshooting")):
                nav.append((sid, label))
            out.append(f'<h2 id="{sid}">{inline(ln[3:])}</h2>')
        elif ln.startswith("### "):
            out.append(f"<h3>{inline(ln[4:])}</h3>")
        elif ln.startswith("> "):
            out.append(f'<p class="note">{inline(ln[2:])}</p>')
        elif ln.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(f"<li>{inline(lines[i][2:])}</li>")
                i += 1
            out.append("<ul>" + "".join(items) + "</ul>")
            continue
        elif ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", c) for c in cells):
                    tag = "th" if not rows else "td"
                    rows.append("<tr>" + "".join(f"<{tag}>{inline(c)}</{tag}>" for c in cells) + "</tr>")
                i += 1
            out.append('<div class="tw"><table>' + "".join(rows) + "</table></div>")
            continue
        elif ln.strip():
            buf = [ln.strip()]
            while i + 1 < len(lines) and lines[i + 1].strip() and not re.match(r"^(#|- |```|\||> )", lines[i + 1]):
                i += 1
                buf.append(lines[i].strip())
            cls = ' class="check"' if buf[0].startswith("**Checkpoint") else ""
            out.append(f"<p{cls}>{inline(' '.join(buf))}</p>")
        i += 1
    return "\n".join(out), nav, n_prompt, n_cmd


def page(n_lab, slug, md):
    md = re.sub(r"^\*\*Lab page:\*\*.*\n\n", "", md, flags=re.M)     # the page carries its own links bar
    body, nav, n_prompt, n_cmd = convert(md)
    folder = f"{GH}tree/main/labs/{slug}"
    links = (f'<a href="{folder}">Lab folder on GitHub</a><a href="{folder}/solution">Reference solution</a>'
             f'<a href="{GH}blob/main/labs/{slug}/sample-output.txt">Sample output</a>')
    daynav = "".join(f'<a href="{PAGES}lab-{k}.html"{" aria-current=page" if k == n_lab else ""}>Lab {k}</a>'
                     for k in LABS) + "<span>|</span>"
    navhtml = "".join(f'<a href="#{s}">{html.escape(t)}</a>' for s, t in nav)
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lab {n_lab} prompts · {COURSE}</title>
<style>
{STYLE}
</style></head><body>
<nav aria-label="Lab sections"><a class="home" href="{PAGES}">All labs</a>{daynav}{navhtml}</nav>
<main>
<div class="links">{links}</div>
{body}
<p class="note">{n_prompt} prompts and {n_cmd} terminal commands on this page. Built from the lab's README.md.</p>
</main>
<footer class="powered-by">Powered by <a href="https://www.tertiaryinfotech.com/" target="_blank" rel="noopener">Tertiary Infotech Academy Pte Ltd</a></footer>
<script>
{SCRIPT}
</script></body></html>
"""


if __name__ == "__main__":
    check, stale = "--check" in sys.argv, []
    for n_lab, slug in LABS.items():
        lab = REPO / "labs" / slug
        text = page(n_lab, slug, (lab / "README.md").read_text(encoding="utf-8"))
        for target in (lab / "prompts.html", REPO / "docs" / f"lab-{n_lab}.html"):
            if check:
                if not target.exists() or target.read_text(encoding="utf-8") != text:
                    stale.append(str(target.relative_to(REPO)))
            else:
                target.write_text(text, encoding="utf-8")
                print("wrote", target.relative_to(REPO))
    if check:
        print("\n".join(f"OUT OF DATE: {s}" for s in stale) or "ok: every prompt page matches its README")
        sys.exit(1 if stale else 0)
