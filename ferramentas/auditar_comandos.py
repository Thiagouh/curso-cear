"""Garante que todo comando usado nos notebooks do aluno tem explicação escrita nos slides.

Extrai das células de código dos notebooks (exceto o corpo das funções de geração de dados,
que o aluno "não precisa entender") as funções/métodos chamados, os atributos lidos e os nomes
de parâmetros. Cada nome precisa aparecer como código («…») ou como parâmetro descrito na seção de
descrições (DOC) de assets/comandos.js — ou seja, explicado por escrito, não só citado num exemplo.

Uso: python ferramentas/auditar_comandos.py      (sai com código 1 se faltar algo)
"""
import ast, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NBS = ['00_dados_e_datasets', '01_regressao_linear', '02_classificacao']
IGNORAR = {'gerar_dados', 'limpar'}     # corpo das funções de geração de dados
TRIVIAIS = {'print', 'len'}             # básicos demais para exigir explicação própria
DO_ALUNO = {'descida_gradiente', 'treino_vs_cv', 'poli'}   # funções escritas no próprio notebook


class Coletor(ast.NodeVisitor):
    def __init__(self): self.n = set()
    def visit_FunctionDef(self, f):
        if f.name not in IGNORAR: self.generic_visit(f)
    def visit_Call(self, c):
        f = c.func
        if isinstance(f, ast.Name): self.n.add(f.id)
        elif isinstance(f, ast.Attribute): self.n.add(f.attr)
        self.n.update(k.arg for k in c.keywords if k.arg)
        self.generic_visit(c)
    def visit_Attribute(self, a):
        self.n.add(a.attr); self.generic_visit(a)


def usados(nb):
    d = json.loads((ROOT / 'notebooks' / f'{nb}_gabarito.ipynb').read_text(encoding='utf-8'))
    col = Coletor()
    for c in d['cells']:
        src = c['source'] if isinstance(c['source'], str) else ''.join(c['source'])
        if c['cell_type'] == 'code' and 'importlib.util.find_spec' not in src:   # pula a célula pronta que instala as bibliotecas
            col.visit(ast.parse(src))
    return col.n - TRIVIAIS - DO_ALUNO


def main():
    js = (ROOT / 'assets' / 'comandos.js').read_text(encoding='utf-8')
    m = re.search(r'/\*DOC:INICIO\*/(.*?)/\*DOC:FIM\*/', js, re.S)
    if not m: sys.exit('seção DOC não encontrada em assets/comandos.js')
    # nomes de código: trechos «…» nas descrições + nomes da lista de parâmetros (p:[["nome", "explicação"]])
    codigo = ' '.join(re.findall(r'«([^»]*)»', m.group(1)) + re.findall(r'\[\s*"([^"]+)"\s*,\s*"', m.group(1)))
    total = 0
    for nb in NBS:
        u = usados(nb)
        falta = sorted(x for x in u if not re.search(r'(?<![\w])' + re.escape(x) + r'(?![\w])', codigo))
        total += len(falta)
        print(f'{nb}: {len(u)} nomes usados · {len(u) - len(falta)} explicados · {len(falta)} faltando')
        if falta: print('   faltam:', ', '.join(falta))
    print('OK: todos os comandos dos notebooks têm explicação escrita.' if not total else f'{total} nomes sem explicação.')
    sys.exit(1 if total else 0)


if __name__ == '__main__':
    main()
