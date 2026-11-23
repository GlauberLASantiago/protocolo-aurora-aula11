"""Preserve the supplied guide's rich HTML in the browser-local library.

Run from the repository root: python scripts/prepare-guide.py
Requires BeautifulSoup only at authoring time; the game has no runtime dependency.
"""
from pathlib import Path
import json
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'content/guia-aula-11.html').read_text(encoding='utf-8-sig')
soup = BeautifulSoup(source, 'html.parser')
original_text = soup.get_text(' ', strip=True)
allowed_tags = {
    'div', 'header', 'footer', 'main', 'section', 'article', 'nav', 'p',
    'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'small', 'br', 'span',
    'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'label', 'input', 'details', 'summary', 'a', 'svg', 'path', 'rect',
}
allowed_attrs = {
    'lang', 'style', 'xmlns', 'width', 'height', 'viewbox', 'fill', 'stroke',
    'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'aria-hidden',
    'd', 'scope', 'x', 'y', 'rx', 'href', 'type',
}
for tag in list(soup.find_all(True)):
    if tag.name not in allowed_tags:
        raise ValueError(f'Unexpected source element: {tag.name}')
    for key in list(tag.attrs):
        if key not in allowed_attrs:
            del tag[key]
    if tag.get('style') and re.search(r'url\s*\(|expression\s*\(|@import|javascript:', tag['style'], re.I):
        raise ValueError('Unexpected active CSS in source')
    if tag.name == 'input' and tag.get('type') != 'checkbox':
        raise ValueError('Only the original local checklist controls are supported')
    if tag.name == 'a':
        if not re.match(r'^https://', tag.get('href', '')):
            raise ValueError('Only HTTPS source links are supported')
        tag['target'] = '_blank'
        tag['rel'] = 'noopener noreferrer'

document = soup.find('div')
document['class'] = 'guide-document'
document['style'] = document.get('style', '').replace('margin:20px auto', 'margin:0 auto')
sections = []
for index, heading in enumerate(soup.find_all('h2'), 1):
    anchor = f'guia11-secao-{index}'
    heading['id'] = anchor
    sections.append({'id': anchor, 'title': heading.get_text(' ', strip=True)})
table_labels = [
    'Comparação entre prompt genérico e prompt contextualizado',
    'Utilização assistiva e utilização potencialmente substitutiva da IA',
    'Cronograma simplificado de produção audiovisual em seis semanas',
]
for table, label in zip(soup.find_all('table'), table_labels, strict=True):
    table['aria-label'] = label
    table['class'] = ['guide-table']
    wrapper = table.parent
    wrapper['class'] = 'guide-table-region'
    wrapper['role'] = 'region'
    wrapper['aria-label'] = label + '. Em telas pequenas, role horizontalmente para ver todas as colunas.'
    wrapper['tabindex'] = '0'
    if label.startswith('Cronograma'):
        table['class'].append('guide-schedule')

# No prose, headings, cells, answer feedback or captions may disappear.
assert soup.get_text(' ', strip=True) == original_text
assert len(soup.find_all('table')) == 3
assert len(soup.find_all('details')) == 6
assert len(sections) == 13
html = str(soup)
text = '\n'.join(s.strip() for s in BeautifulSoup(source, 'html.parser').stripped_strings)
(ROOT / 'dist/guide.js').write_text(
    '/* Rich guide compiled from the supplied source; do not flatten to plain text. */\n'
    + 'const GUIDE_HTML=' + json.dumps(html, ensure_ascii=False) + ';\n'
    + 'const GUIDE_SECTIONS=' + json.dumps(sections, ensure_ascii=False) + ';\n'
    + 'const GUIDE_TEXT=' + json.dumps(text, ensure_ascii=False) + ';\n',
    encoding='utf-8',
)
# A native, script-free reading route remains usable if game scripts cannot load.
(ROOT / 'dist/guia-aula-11.html').write_text(
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1">'
    '<title>Guia de estudos - Aula 11 | Protocolo Aurora</title>'
    '<style>body{margin:0;padding:20px 12px;background:#f1f0f8;font-family:Segoe UI,system-ui,sans-serif}'
    '.guide-reading-nav{max-width:850px;margin:0 auto 20px;line-height:1.7}'
    '.guide-reading-nav a{color:#604295;font-weight:600}'
    '.guide-table-region{overflow:auto}.guide-table{min-width:560px}'
    '.guide-schedule{min-width:660px!important}</style></head><body>'
    '<nav class="guide-reading-nav" aria-label="Navegação do material"><a href="./">Voltar ao Protocolo Aurora</a></nav>'
    + html + '</body></html>', encoding='utf-8',
)
print(f'Guide preserved: {len(sections)} sections, 3 tables, 6 expandable answer explanations.')
