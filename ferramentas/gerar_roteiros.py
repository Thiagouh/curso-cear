"""Gera os roteiros do apresentador (TXT e PDF) a partir das apresentações.

Lê cada slide de dia1.html / dia2.html já renderizado (título, notas, tópicos das capas,
passos dos labs e a lista dos slides de comandos) e escreve roteiros/roteiro_diaN.txt e .pdf.
O cabeçalho ("Antes de começar") é preservado do TXT existente.

Requer: pip install playwright && python -m playwright install chromium
Uso:    python ferramentas/gerar_roteiros.py          (os dois dias)
        python ferramentas/gerar_roteiros.py 1        (só o dia 1)
"""
import html, os, re, sys, textwrap
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
W = 92
RULE_EQ, RULE = '=' * W, '-' * W

EXTRACT = r"""() => {
  const txt = el => { if (!el) return ''; const c = el.cloneNode(true); c.querySelectorAll('br').forEach(b => b.replaceWith(' '));
    c.querySelectorAll('.blk,.num').forEach(x => x.remove()); return c.textContent.replace(/\s+/g, ' ').trim() };
  const all = [...document.querySelectorAll('#stage > .s')], heads = {};
  all.forEach(s => { const b = +s.dataset.b, blk = s.querySelector('.blk'); if (b > 1 && blk && !heads[b]) heads[b] = txt(blk) });
  return all.map((s, i) => {
    const d = s.dataset, b = +d.b, o = { n: i + 1, b, head: b > 1 ? heads[b] : 'INTRODUÇÃO', notes: d.notes || '' };
    if (s.classList.contains('sec')) { o.kind = 'sec'; o.items = d.items.split(';').map(t => t.replace(/^lab:/, '')); o.q = d.q;
      o.title = txt(s.querySelector('.secL h1')); o.num = txt(s.querySelector('.secn')) }
    else if (d.lab) { const [num, name, file] = d.lab.split('|'); o.kind = 'lab'; o.title = (num === '04' ? 'Desafio ' : 'Lab ') + num + ' · ' + name;
      o.file = file; o.steps = d.steps.split(';').map(x => x.split('|')[1]); o.q = d.q }
    else if (d.pause) { o.kind = 'pause'; o.title = d.label || 'Pausa'; o.next = d.next || '' }
    else { o.kind = d.cmd || d.id === 'gdc' ? 'cmd' : 'slide'; o.title = txt(s.querySelector('h2') || s.querySelector('h1'));
      o.cmds = [...s.querySelectorAll('.cchip')].map(c => c.querySelector('code').textContent + ' — ' + c.querySelector('small').textContent) }
    return o });
}"""


def fala(notes):
    return re.sub(r'^[^a-zà-ú“"]*?\(\d+ min\)\.?\s*', '', notes).strip()


def wrap(text, first, rest='     '):
    return textwrap.fill(text, W, initial_indent=first, subsequent_indent=rest, break_long_words=False)


def numbered(items, out):
    for k, t in enumerate(items, 1):
        out.append(wrap(t, f'       {k}. ', '          '))


def header_of(day):
    p = ROOT / 'roteiros' / f'roteiro_dia{day}.txt'
    lines = p.read_text(encoding='utf-8').split('\n')
    end = next(i for i, l in enumerate(lines) if l.startswith('---'))
    hdr = lines[:end]
    while hdr and not hdr[-1].strip(): hdr.pop()
    sub = hdr[2].strip()
    i = next(k for k, l in enumerate(hdr) if l.strip() == 'ANTES DE COMEÇAR')
    bullets = [l.strip()[2:] for l in hdr[i + 1:] if l.strip().startswith('- ')]
    return hdr, sub, bullets


def build_txt(day, S, hdr):
    out = hdr + ['', '']
    cur = None
    for s in S:
        h = s['head'] or 'INTRODUÇÃO'
        if h != cur:
            out += [RULE, h, RULE, '']; cur = h
        tag = f"[{s['n']:02d}] "
        if s['kind'] == 'sec':
            out.append(f"{tag}Capa do módulo {s['num']} · {s['title']}")
            out.append('     Tópicos:'); numbered(s['items'], out)
            out.append(wrap(s['q'], '     Pergunta-guia: '))
        elif s['kind'] == 'lab':
            out.append(tag + s['title'])
            out.append(f"     Notebook: {s['file']}"); out.append('     Passos:'); numbered(s['steps'], out)
            out.append(wrap(s['q'], '     Para discutir: '))
        elif s['kind'] == 'pause':
            out.append(tag + s['title'])
            if s['next']: out.append(f"     Na tela: {s['next']}")
        else:
            out.append(tag + s['title'] + ('  [no notebook]' if s['kind'] == 'cmd' else ''))
            if s['cmds']:
                out.append('     Comandos:'); numbered(s['cmds'], out)
        if fala(s['notes']): out.append(wrap(fala(s['notes']), '     Fala: '))
        out.append('')
    while out and not out[-1].strip(): out.pop()
    return '\n'.join(out) + '\n'


CSS = """@page{size:A4;margin:16mm 16mm 18mm}
body{font:10.5pt/1.55 "Segoe UI","Noto Sans",Arial,sans-serif;color:#1d2433;margin:0}
.k{font-size:8pt;font-weight:700;letter-spacing:.32em;color:#5a6488;text-transform:uppercase}
h1{font-size:24pt;margin:4px 0 0}.sub{font-style:italic;color:#4a5578;margin-bottom:10px}
hr{border:0;border-top:2.5px solid #1d2433;margin:0 0 14px}
.pre{background:#eef1f8;border-radius:8px;padding:10px 16px;margin-bottom:22px}.pre b{display:block;margin-bottom:4px}.pre ul{margin:0;padding-left:20px}
.band{background:#e2f2f7;border-left:5px solid #0e8fae;padding:8px 16px;margin:20px 0 10px;break-after:avoid;break-inside:avoid}
.band .k{color:#0e8fae}.band div:last-child{font-size:13pt;font-weight:700}
.it{display:grid;grid-template-columns:44px 1fr;padding:6px 0 9px;border-bottom:1px solid #e3e7f0;break-inside:avoid}
.n{font:700 8pt Consolas,monospace;background:#0e8fae;color:#fff;border-radius:5px;height:15px;width:26px;text-align:center;margin-top:3px}
.t{font-weight:700}.tag{font-size:7pt;font-weight:700;letter-spacing:.14em;border:1.5px solid #0e8fae;color:#0e8fae;border-radius:99px;padding:0 6px;margin-left:6px;vertical-align:1px}
.tag.nb{border-color:#c2410c;color:#c2410c}
.l{font-weight:700;color:#0e8fae}ol{margin:2px 0 4px;padding-left:22px}code{font:9pt Consolas,monospace}p{margin:3px 0}"""


def build_html(day, S, sub, bullets):
    e = html.escape
    h = [f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Roteiro · Dia {day}</title><style>{CSS}</style></head><body>',
         f'<div class="k">Roteiro do apresentador · Machine Learning na Prática</div><h1>Dia {day} de 2</h1><div class="sub">{e(sub)}</div><hr>',
         '<div class="pre"><b>Antes de começar</b><ul>' + ''.join(f'<li>{e(x)}</li>' for x in bullets) + '</ul></div>']
    cur = None
    for s in S:
        hd = s['head'] or 'INTRODUÇÃO'
        if hd != cur:
            cur = hd
            if hd.startswith('MÓDULO'):
                k, name = hd.split('·', 1); name = next((x['title'] for x in S if x['kind'] == 'sec' and x['head'] == hd), name.strip().title())
            else:
                k, name = 'Abertura', hd.capitalize()
            h.append(f'<div class="band"><div class="k">{e(k.strip())}</div><div>{e(name)}</div></div>')
        body = []
        if s['kind'] == 'sec':
            title = f"Capa do módulo {s['num']} · {s['title']}"; tag = '<span class="tag">CAPA</span>'
            body += ['<b>Tópicos:</b><ol>' + ''.join(f'<li>{e(x)}</li>' for x in s['items']) + '</ol>', f'<p><b>Pergunta-guia:</b> {e(s["q"])}</p>']
        elif s['kind'] == 'lab':
            title = s['title']; tag = '<span class="tag">LAB</span>'
            body += [f'<p><b>Notebook:</b> <code>{e(s["file"])}</code></p><b>Passos:</b><ol>' + ''.join(f'<li>{e(x)}</li>' for x in s['steps']) + '</ol>', f'<p><b>Para discutir:</b> {e(s["q"])}</p>']
        elif s['kind'] == 'pause':
            title = s['title']; tag = '<span class="tag">PAUSA</span>'
            if s['next']: body.append(f'<p><b>Na tela:</b> {e(s["next"])}</p>')
        else:
            title = s['title']; tag = '<span class="tag nb">NO NOTEBOOK</span>' if s['kind'] == 'cmd' else ''
            if s['cmds']:
                body.append('<b>Comandos:</b><ol>' + ''.join(f'<li><code>{e(c.split(" — ")[0])}</code> — {e(c.split(" — ", 1)[1])}</li>' for c in s['cmds']) + '</ol>')
        if fala(s['notes']): body.append(f'<p><span class="l">Fala:</span> {e(fala(s["notes"]))}</p>')
        h.append(f'<div class="it"><div class="n">{s["n"]:02d}</div><div><div class="t">{e(title)}{tag}</div>{"".join(body)}</div></div>')
    return ''.join(h) + '</body></html>'


def main():
    days = [int(a) for a in sys.argv[1:]] or [1, 2]
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        for day in days:
            pg.goto((ROOT / f'dia{day}.html').as_uri()); pg.wait_for_timeout(800)
            S = pg.evaluate(EXTRACT)
            hdr, sub, bullets = header_of(day)
            (ROOT / 'roteiros' / f'roteiro_dia{day}.txt').write_text(build_txt(day, S, hdr), encoding='utf-8', newline='\n')
            tmp = ROOT / 'roteiros' / f'_roteiro_dia{day}.html'
            tmp.write_text(build_html(day, S, sub, bullets), encoding='utf-8')
            pg.goto(tmp.as_uri()); pg.wait_for_timeout(300)
            pg.pdf(path=str(ROOT / 'roteiros' / f'roteiro_dia{day}.pdf'), format='A4', print_background=True,
                   display_header_footer=True, header_template='<span></span>',
                   footer_template=f'<div style="font:8px Segoe UI,Arial;color:#8a94b8;width:100%;text-align:center">Roteiro · Dia {day} · <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
                   margin={'top': '16mm', 'bottom': '18mm', 'left': '16mm', 'right': '16mm'})
            tmp.unlink()
            print(f'ok dia {day}: {len(S)} slides')
        b.close()


if __name__ == '__main__':
    main()
