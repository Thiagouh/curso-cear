"""Gera os notebooks dos labs do dia 1 (versão do aluno + gabarito).
Em células de código, ⟦solução⟧ vira ___ na versão do aluno e a solução no gabarito.
Células nota(...) trazem o que o aluno deveria perceber em cada saída e só aparecem no gabarito."""
import json, re, sys, os

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'notebooks')
GAB_NOTE = '\n\n> **Gabarito.** Versão do professor, com todas as células resolvidas. Não compartilhe antes da atividade.'


def md(s): return ('md', s.strip('\n'))
def code(s): return ('code', s.strip('\n'))
def nota(s): return ('gab', s.strip('\n'))   # só aparece no gabarito


def render(cells, gab):
    out = []
    for i, (kind, src) in enumerate(cells):
        if kind == 'gab':
            if not gab:
                continue
            corpo = '\n'.join('> ' + l if l else '>' for l in src.split('\n'))
            out.append({'cell_type': 'markdown', 'metadata': {}, 'source': '> 🔎 **Gabarito · o que observar**\n>\n' + corpo})
            continue
        if kind == 'md':
            if i == 0 and gab:
                src += GAB_NOTE
            out.append({'cell_type': 'markdown', 'metadata': {}, 'source': src})
        else:
            s = re.sub(r'⟦(.*?)⟧', (lambda m: m.group(1)) if gab else '___', src, flags=re.S)
            out.append({'cell_type': 'code', 'metadata': {}, 'execution_count': None, 'outputs': [], 'source': s})
    return {'cells': out, 'metadata': {'colab': {'provenance': []}, 'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'},
            'language_info': {'name': 'python'}}, 'nbformat': 4, 'nbformat_minor': 5}


def save(name, cells):
    for gab in (False, True):
        fn = os.path.join(OUT, name + ('_gabarito' if gab else '') + '.ipynb')
        json.dump(render(cells, gab), open(fn, 'w'), ensure_ascii=False, indent=1)
        print('ok', fn)


# ------------------------------------------------------------------ dados compartilhados
GERAR = r'''def gerar_dados(n=400, seed=42):
    rng = np.random.default_rng(seed)
    horas = np.clip(rng.normal(6, 2.2, n), 0.5, 14).round(1)
    faltas = rng.poisson(3, n)
    turno = rng.choice(['manhã', 'tarde', 'noite'], n, p=[.45, .3, .25])
    monitoria = rng.choice(['sim', 'não'], n, p=[.35, .65])
    idade = rng.integers(17, 31, n)
    renda = np.round(rng.lognormal(8.2, 0.5, n), -1)          # R$ por mês, escala grande
    nota = (2.0 + 0.45 * horas - 0.25 * faltas + 0.6 * (monitoria == 'sim')
            - 0.4 * (turno == 'noite') + rng.normal(0, 0.9, n))
    nota = np.clip(nota, 0, 10).round(1)
    df = pd.DataFrame({'horas_estudo': horas, 'faltas': faltas, 'turno': turno,
                       'monitoria': monitoria, 'idade': idade, 'renda_familiar': renda,
                       'nota_final': nota})
    df['situacao'] = np.where(df['nota_final'] >= 6, 'aprovado', 'reprovado')

    # ---- problemas do mundo real ----
    sujo = rng.choice(n, 40, replace=False)
    df.loc[sujo[:14], 'turno'] = rng.choice(['Manhã', 'MANHÃ ', 'manha', 'Noite', ' tarde'], 14)
    df.loc[rng.choice(n, 20, replace=False), 'horas_estudo'] = np.nan
    df.loc[rng.choice(n, 15, replace=False), 'faltas'] = np.nan
    df.loc[rng.choice(n, 8, replace=False), 'nota_final'] = np.nan
    outl = rng.choice(n, 4, replace=False)
    df.loc[outl, 'horas_estudo'] = df.loc[outl, 'horas_estudo'].fillna(7) * 10   # vírgula esquecida
    df = pd.concat([df, df.sample(12, random_state=seed)], ignore_index=True)   # duplicados
    return df.sample(frac=1, random_state=seed).reset_index(drop=True)'''

LIMPAR = r'''def limpar(df):
    """A mesma limpeza do Lab 00."""
    df = df.drop_duplicates().copy()
    df['turno'] = df['turno'].str.strip().str.lower().replace({'manha': 'manhã'})
    df.loc[df['horas_estudo'] > 24, 'horas_estudo'] = np.nan
    return df.dropna(subset=['nota_final']).reset_index(drop=True)'''


INSTALAR = md('''
### Bibliotecas
No **Google Colab** tudo já vem instalado: esta célula só confere. Em outro ambiente (Jupyter no seu PC), ela instala o que faltar.
'''), code('''
import importlib.util, subprocess, sys
pacotes = {'numpy': 'numpy', 'pandas': 'pandas', 'matplotlib': 'matplotlib', 'sklearn': 'scikit-learn'}
faltando = [pip for modulo, pip in pacotes.items() if importlib.util.find_spec(modulo) is None]
if faltando:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', *faltando])
print('Bibliotecas prontas!' if not faltando else f'Instalado agora: {", ".join(faltando)}')
''')

# ================================================================== LAB 00
lab00 = [
md('''
# Lab 00 · Arrume a casa antes de modelar
**Machine Learning na Prática · Dia 1 · Módulo 01: Dados & Datasets**

Neste notebook você vai fazer o que todo projeto de ML faz **antes** de treinar qualquer modelo.
Aqui **não há modelo nem métricas**: o objetivo é deixar os dados prontos. O treino começa no Lab 01, já com estes dados limpos.

| Etapa | O que fazer |
|---|---|
| 1. Inspecionar | formato, tipos, estatísticas, faltantes |
| 2. Limpar | duplicados, categorias, outliers, alvo faltante |
| 3. Explorar | histogramas, boxplot, correlação |
| 4. Preparar | features × alvo, split, one-hot, padronização e `Pipeline` sem vazamento |

Procure as células marcadas com **`# TODO`** e substitua os `___` pelo código certo.
Rode as células em ordem (`Shift + Enter`).
'''),
md('''
### Cola rápida de pandas
| Para… | use |
|---|---|
| ler um CSV | `pd.read_csv('arquivo.csv')` |
| formato (linhas, colunas) / tipos | `df.shape` / `df.info()` |
| estatísticas das colunas numéricas | `df.describe()` |
| faltantes por coluna | `df.isna().sum()` |
| contar valores de uma coluna | `df['col'].value_counts()` |
| achar / remover duplicados | `df.duplicated().sum()` / `df.drop_duplicates()` |
| limpar texto | `df['col'].str.strip().str.lower()` |
| remover linhas com faltante numa coluna | `df.dropna(subset=['col'])` |
| histogramas | `df.hist()` |
| correlação | `df.corr(numeric_only=True)` |
| média de um grupo | `df.groupby('col')['outra'].mean()` |
'''),
*INSTALAR,
md('## 0 · Preparação'),
code('''
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

pd.set_option('display.max_columns', 20)
plt.rcParams['figure.figsize'] = (8, 4)
print('Tudo pronto!')
'''),
md('''
### O dataset: desempenho de estudantes
Os dados abaixo são **sintéticos** (gerados aqui mesmo, para não depender de download), mas imitam problemas reais:
alguém digitou errado, algumas linhas foram copiadas duas vezes, o turno foi escrito de jeitos diferentes…

Rode a célula para criar o arquivo `alunos.csv`. Você **não precisa** entender o código de geração agora.
'''),
code(GERAR + "\n\ngerar_dados().to_csv('alunos.csv', index=False)\nprint('alunos.csv criado!')"),
md('## 1 · Inspecionar'),
md('Carregue o arquivo e olhe as primeiras linhas.'),
code('''
# TODO: leia o arquivo 'alunos.csv' com o pandas
df = ⟦pd.read_csv('alunos.csv')⟧
df.head()
'''),
nota('''
- Cada linha é um aluno; `nota_final` é o **alvo** e as outras colunas são candidatas a feature.
- `renda_familiar` está na casa dos milhares e `horas_estudo` na casa das unidades: escalas muito diferentes (isso volta na padronização).
- `situacao` parece só mais uma coluna, mas ela é **derivada da nota** (veja a seção 4.1).
'''),
code('''
# TODO: quantas linhas e colunas? E quais os tipos de cada coluna?
print(df.⟦shape⟧)
df.⟦info⟧()
'''),
nota('''
- **412 linhas × 8 colunas**, mas o gerador criou 400 alunos: as 12 a mais são duplicados (seção 2.1).
- O `Non-Null Count` já denuncia os faltantes: `horas_estudo` (393), `faltas` (395) e `nota_final` (404) têm menos de 412.
- `faltas` é contagem (inteiro), mas aparece como `float64`: no pandas, basta **um `NaN`** para a coluna inteira virar float.
- `turno`, `monitoria` e `situacao` são texto (`object` ou `str`, conforme a versão do pandas) e vão precisar virar números.
'''),
code('''
# TODO: estatísticas das colunas numéricas. Repare no máximo de horas_estudo!
df.⟦describe⟧()
'''),
nota('''
- **`horas_estudo`: máximo 70**, enquanto 75% dos alunos estudam até 7,4 h. É o outlier da “vírgula esquecida”.
- Esse outlier contamina as estatísticas: a média (6,47) já passa da mediana (6,0) e o desvio (5,76) está inflado. Depois da limpeza, o desvio cai para cerca de 2,2.
- `nota_final` vai de 0 a 8, com média ≈ 4,1: **a maioria reprova** (só 30 dos 392 alunos finais têm nota ≥ 6).
- `renda_familiar` tem máximo 17 060 contra mediana 3 720. É cauda longa, mas **plausível**: não é erro de digitação e não deve ser apagada.
- `idade` (17 a 30) e `faltas` (0 a 9) estão dentro do esperado.
'''),
code('''
# TODO: quantos valores faltantes há em cada coluna?
df.⟦isna⟧().sum()
'''),
nota('''
- Faltantes: `horas_estudo` 19, `faltas` 17, `nota_final` 8.
- Faltante em **feature** dá para preencher (imputar); faltante no **alvo** não, porque não há o que ensinar ao modelo com essa linha (seção 2.4).
'''),
code('''
# TODO: quais valores aparecem na coluna 'turno'?
df['turno'].⟦value_counts⟧()
'''),
nota('''
- Deveriam ser 3 categorias, mas aparecem **8**: `manha`, `Manhã`, `MANHÃ ` (com espaço), `Noite`, ` tarde`…
- Para o computador são valores diferentes. Sem limpar, o one-hot criaria 8 colunas para 3 turnos de verdade.
'''),
md('''
**Para pensar:** liste os problemas que você encontrou. Quais colunas têm faltantes? O que há de estranho em `turno` e em `horas_estudo`?

*Sua resposta:* …
'''),
nota('''
**Resposta esperada:** faltantes em `horas_estudo`, `faltas` e `nota_final`; `turno` escrito de vários jeitos;
`horas_estudo` com valores absurdos (70, 68, 64); 12 linhas duplicadas; e escalas muito diferentes entre as colunas numéricas.
'''),
md('## 2 · Limpar'),
md('### 2.1 Duplicados'),
code('''
# TODO: conte as linhas duplicadas e remova-as
print('duplicados:', df.duplicated().⟦sum⟧())
df = df.⟦drop_duplicates⟧()
print('linhas agora:', len(df))
'''),
nota('''
- **12 duplicados** → 400 linhas, exatamente o número de alunos gerados.
- Duplicado é perigoso porque a mesma linha pode cair no treino **e** no teste: o modelo “vê” a resposta antes da prova.
'''),
md('''
### 2.2 Categorias inconsistentes
Para o computador, `"manhã"`, `"Manhã"` e `"MANHÃ "` são três valores diferentes.
Padronize: tire os espaços das pontas, deixe tudo minúsculo e corrija `"manha"` sem acento.
'''),
code('''
# TODO: padronize a coluna turno
df['turno'] = df['turno'].str.⟦strip⟧().str.⟦lower⟧()
df['turno'] = df['turno'].replace({'manha': 'manhã'})
df['turno'].value_counts()
'''),
nota('''
- Agora são só 3 categorias: manhã 193, tarde 104, noite 103.
- A ordem importa: primeiro `strip` e `lower`, depois o `replace` de `manha` → `manhã`.
'''),
md('''
### 2.3 Outliers
Ninguém estuda 70 horas *extras* por semana: provavelmente alguém esqueceu a vírgula (7,0 → 70).
Há duas saídas: **corrigir** (dividir por 10, como no slide) ou **descartar o valor** (virar `NaN`).
Como **não temos certeza** do valor certo, aqui vamos transformar em `NaN`; depois ele será preenchido como os outros faltantes.
'''),
code('''
plt.boxplot(df['horas_estudo'].dropna())
plt.title('horas_estudo antes da limpeza'); plt.show()

# TODO: transforme em NaN os valores de horas_estudo acima de 24
df.loc[df['horas_estudo'] > ⟦24⟧, 'horas_estudo'] = np.nan
df['horas_estudo'].describe()
'''),
nota('''
- O boxplot mostra três pontos isolados lá em cima (70, 68 e 64) e a caixa toda espremida embaixo.
- Depois da regra, o máximo vira **15** e o desvio cai de 5,76 para 2,16.
- **Pegadinha:** esse 15 também é um erro (o valor real era 1,5), mas 15 h por semana é plausível, então a regra `> 24` não o pega.
  Nem todo erro é detectável por regra simples. Ele vai reaparecer no Lab 01, puxando a reta para baixo.
'''),
md('''
### 2.4 Alvo faltante
Uma linha sem `nota_final` não ensina nada: remova-a.
Os faltantes nas **features** (horas, faltas) **não** serão preenchidos agora — isso será feito dentro do `Pipeline`, usando só o treino (etapa 4).
'''),
code('''
# TODO: remova as linhas sem nota_final
df = df.dropna(subset=[⟦'nota_final'⟧])
print(len(df), 'linhas')
df.isna().sum()
'''),
nota('''
- **392 linhas** ficam. `nota_final` não tem mais faltantes.
- `horas_estudo` agora tem 21 faltantes (inclui os 3 outliers que viraram `NaN`) e `faltas` tem 15. Eles **continuam** faltando de propósito: quem preenche é o `Pipeline`, olhando só o treino.
'''),
md('## 3 · Explorar'),
code('''
# TODO: histogramas de todas as colunas numéricas
df.⟦hist⟧(bins=20, figsize=(12, 6))
plt.tight_layout(); plt.show()
'''),
nota('''
- `renda_familiar` é **assimétrica à direita** (cauda longa de rendas altas).
- `horas_estudo` ficou aproximadamente simétrica depois da limpeza.
- `faltas` é discreta (só inteiros); `idade` é quase uniforme entre 17 e 30.
- `nota_final` se concentra entre 3 e 5, e poucas passam de 6.
'''),
md('**Média × mediana:** compare as duas para `horas_estudo` e para `renda_familiar`. Em qual delas a diferença é maior? Por quê?'),
code('''
for col in ['horas_estudo', 'renda_familiar']:
    # TODO: calcule a média e a mediana da coluna
    print(f"{col}: média = {df[col].⟦mean⟧():.1f} | mediana = {df[col].⟦median⟧():.1f}")
'''),
nota('''
- `horas_estudo`: média 6,0 e mediana 6,0, praticamente iguais (distribuição simétrica).
- `renda_familiar`: média ≈ 4 175 e mediana 3 690. A cauda de rendas altas **puxa a média para cima**; a mediana não liga para ela.
- É por isso que, no `Pipeline`, os faltantes são preenchidos com a **mediana**.
'''),
code('''
# TODO: gráfico de dispersão horas_estudo × nota_final
plt.scatter(df[⟦'horas_estudo'⟧], df[⟦'nota_final'⟧], alpha=.5)
plt.xlabel('horas de estudo'); plt.ylabel('nota final'); plt.show()
'''),
nota('''
- Tendência clara de **subida**: mais horas, nota maior em média.
- Mas há muita dispersão: alunos com as mesmas horas têm notas bem diferentes. Horas sozinhas não explicam tudo.
- Repare num ponto solto lá à direita, em 15 h com nota baixa: é o erro que a regra não pegou.
'''),
code('''
# TODO: correlação entre as colunas numéricas
df.⟦corr⟧(numeric_only=True).round(2)
'''),
nota('''
- `horas_estudo` × nota: **+0,62** (a mais forte). `faltas` × nota: **−0,31** (mais faltas, nota menor).
- `idade` (0,03) e `renda_familiar` (−0,07) ≈ 0: praticamente **nenhuma relação linear** com a nota.
- As features quase não se correlacionam entre si, o que é bom para a regressão.
- A correlação só mede relação **linear** entre colunas numéricas: `turno` e `monitoria` nem aparecem aqui.
'''),
code('''
# TODO: nota média por turno e por monitoria
df.groupby(⟦['turno', 'monitoria']⟧)['nota_final'].mean().round(2)
'''),
nota('''
- Em **todos** os turnos, quem faz monitoria tem nota média maior (+0,4 a +0,75 ponto).
- O turno da **noite** tem as menores médias (3,53 sem e 3,90 com monitoria).
- Ou seja: as categorias carregam informação, e o one-hot é o jeito de entregá-las ao modelo.
'''),
md('''
**Para pensar:** quais features parecem ajudar a prever a nota? Alguma parece não ter relação nenhuma?
Lembre: correlação não é causalidade.

*Sua resposta:* …
'''),
nota('''
**Resposta esperada:** `horas_estudo` (a mais forte), `faltas`, `monitoria` e `turno` ajudam; `idade` e `renda_familiar` parecem não ter relação.
Correlação não é causa: a monitoria pode atrair justamente os alunos mais dedicados, por exemplo.
'''),
md('''
## 4 · Preparar sem vazamento
### 4.1 Features × alvo — e a coluna que “conta a resposta”
O alvo é `nota_final`. A coluna `situacao` (aprovado/reprovado) é **calculada a partir da nota**: ela só existe *depois* que a nota sai.
Usá-la como feature seria **vazamento de dados** — o modelo “colaria” a resposta. Veja como ela entrega a nota:
'''),
code('''
# TODO: menor e maior nota em cada situação
df.groupby('situacao')['nota_final'].agg([⟦'min'⟧, ⟦'max'⟧])
'''),
nota('''
- Aprovado: notas de **6,0 a 8,0**. Reprovado: de **0,0 a 5,9**. A separação é perfeita, sem nenhuma sobreposição.
- Com `situacao` como feature, o modelo descobriria a regra “nota ≥ 6” e pareceria ótimo, mas na vida real essa coluna **só existe depois** da nota. É vazamento.
'''),
code('''
alvo = 'nota_final'
# TODO: escolha as features (todas menos o alvo e a coluna que vaza)
X = df.drop(columns=[alvo, ⟦'situacao'⟧])
y = df[alvo]

num = ['horas_estudo', 'faltas', 'idade', 'renda_familiar']
cat = ['turno', 'monitoria']
X.head()
'''),
nota('''
- Sobram **6 features**: 4 numéricas e 2 categóricas.
'''),
md('''
### 4.2 Separar treino e teste **antes** de qualquer transformação
Aqui fazemos só treino (80%) e teste (20%). A “validação” do slide será feita com **validação cruzada** dentro do treino, a partir do Lab 01.
'''),
code('''
# TODO: 80% treino, 20% teste, random_state=42
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=⟦0.2⟧, random_state=42)
print(X_tr.shape, X_te.shape)
'''),
nota('''
- **313 linhas de treino e 79 de teste** (80/20 de 392).
- O `random_state=42` faz todo mundo da turma ter a mesma divisão, então os números batem entre os colegas.
'''),
md('''
### 4.3 O preparo em um `Pipeline`
Cada peça tem um papel:
- `SimpleImputer(strategy='median')` — preenche faltantes com a **mediana** (robusta a outliers, como vimos na EDA);
- `StandardScaler()` — padroniza: `z = (x − μ) / σ`;
- `OneHotEncoder(handle_unknown='ignore')` — uma coluna 0/1 por categoria; se o teste trouxer uma categoria que o treino nunca viu, ela vira só zeros em vez de dar erro;
- `ColumnTransformer` — aplica um tratamento diferente para cada **tipo** de coluna;
- `Pipeline` — encadeia os passos e garante a ordem: tudo é **ajustado (`fit`) só no treino**.
'''),
code('''
preparo = ColumnTransformer([
    # TODO: complete com SimpleImputer(strategy='median') e StandardScaler()
    ('num', Pipeline([('imputar', ⟦SimpleImputer(strategy='median')⟧), ('padronizar', ⟦StandardScaler()⟧)]), num),
    ('cat', OneHotEncoder(handle_unknown='ignore'), cat),
])

# TODO: ajuste no treino e transforme o treino; depois só TRANSFORME o teste
Z_tr = preparo.⟦fit_transform⟧(X_tr)
Z_te = preparo.⟦transform⟧(X_te)

colunas = preparo.get_feature_names_out()
pd.DataFrame(Z_tr, columns=colunas).head()
'''),
nota('''
- Agora são **9 colunas**: 4 numéricas padronizadas + 3 de turno + 2 de monitoria.
- As numéricas ficam em torno de 0 (ex.: −2,18 = bem abaixo da média do treino).
- Em cada linha, há exatamente **um 1** entre as colunas de turno e um entre as de monitoria.
- Não sobrou nenhum `NaN`: o imputador preencheu tudo com a mediana do treino.
'''),
md('''
### 4.4 O que o `fit` aprendeu — e de onde
O `StandardScaler` guarda a média ($\\mu$) e o desvio ($\\sigma$) que aprendeu no `fit`.
Ajustado **só no treino**, as colunas do treino ficam com média 0 e desvio 1; as do teste ficam **perto**, mas não exatamente — afinal, o teste é “novo”.
'''),
code('''
n_num = len(num)
pd.DataFrame({
    'média treino':  Z_tr[:, :n_num].mean(axis=0),
    'desvio treino': Z_tr[:, :n_num].std(axis=0),
    'média teste':   Z_te[:, :n_num].mean(axis=0),
}, index=num).round(3)
'''),
nota('''
- No treino: média **0** e desvio **1** em todas as colunas, por construção.
- No teste: médias perto de 0, mas não exatas (algo como 0,12; 0,06; 0,06; −0,14). Isso é o **esperado**: o teste foi transformado com o μ e o σ do treino.
- Se o teste também saísse com média 0 exata, seria sinal de que ele participou do ajuste.
'''),
md('''
Agora o jeito **errado**: ajustar o scaler com o dataset inteiro (treino + teste) antes de separar.
O $\\mu$ aprendido muda — ou seja, **informação do teste entrou no ajuste**. Com poucos dados ou estatísticas mais sensíveis, isso infla o resultado.
'''),
code('''
mu_certo = preparo.named_transformers_['num'].named_steps['padronizar'].mean_
# TODO: ajuste um StandardScaler com TODO o X numérico (o jeito errado) e pegue as médias
mu_errado = StandardScaler().⟦fit⟧(X[num].fillna(X[num].median())).mean_

pd.DataFrame({'μ só treino (certo)': mu_certo, 'μ treino + teste (errado)': mu_errado}, index=num).round(2)
'''),
nota('''
- As médias mudam pouco (ex.: renda 4 239 × 4 175), mas **mudam**: o μ “errado” carrega informação do teste.
- Aqui o efeito é pequeno porque há bastante dado e a média é estável. O problema é de princípio:
  com poucos dados, transformações mais complexas ou seleção de features, o vazamento infla a nota do modelo.
'''),
md('''
### 4.5 Salvar os dados limpos
O Lab 01 começa exatamente daqui, com esta versão limpa.
'''),
code('''
df.to_csv('alunos_limpo.csv', index=False)
print(df.shape, '→ alunos_limpo.csv')
'''),
nota('''
- `(392, 8)`: o `alunos_limpo.csv` é o ponto de partida do Lab 01.
- Ele ainda tem `NaN` nas features e ainda tem `situacao`. Isso é de propósito: quem cuida disso é o `Pipeline` de cada modelo.
'''),
md('''
## 5 · Desafios extras (se sobrar tempo)
### 5.1 Quem é mais parecido com você? (escala em código)
Compare o aluno mais parecido com o primeiro aluno do treino usando a **distância euclidiana**,
com e sem padronização. Use só as colunas numéricas sem faltantes.
'''),
code('''
cols = ['faltas', 'idade', 'renda_familiar']
A = X_tr[cols].dropna()
voce, outros = A.iloc[0], A.iloc[1:]

def mais_parecido(dados, ref):
    dist = np.sqrt(((dados - ref) ** 2).sum(axis=1))
    return dist.idxmin()

# TODO: padronize com a média e o desvio de A
Az = (A - A.⟦mean⟧()) / A.⟦std⟧()

print('você:', voce.to_dict())
print('sem padronizar →', A.loc[mais_parecido(outros, voce)].to_dict())
print('padronizando   →', A.loc[mais_parecido(Az.iloc[1:], Az.iloc[0])].to_dict())
'''),
nota('''
- **Sem padronizar**, o “mais parecido” tem renda quase igual (8 150 × 8 170) mas idade **17 contra 22**: só a renda decidiu.
- **Padronizando**, aparece alguém com a **mesma idade** (22) e renda próxima (8 850).
- Sem padronizar, uma diferença de 20 reais pesa o mesmo que 20 anos, porque a distância soma números crus.
'''),
md('**Para pensar:** sem padronizar, qual coluna decidiu quem é “parecido”? Por quê?'),
nota('''
**Resposta esperada:** `renda_familiar`, porque está na casa dos milhares e domina a soma das diferenças ao quadrado.
'''),
md('''
### 5.2 Label encoding × one-hot
Transforme `turno` em números das duas formas e compare.
'''),
code('''
label = df['turno'].map({'noite': 0, 'manhã': 1, 'tarde': 2})
# TODO: one-hot da coluna turno com o pandas
onehot = pd.⟦get_dummies⟧(df['turno'], prefix='turno', dtype=int)
pd.concat([df['turno'], label.rename('label'), onehot], axis=1).head()
'''),
nota('''
- O label encoding cria uma **ordem falsa**: noite (0) < manhã (1) < tarde (2), e a “distância” de noite até tarde vira o dobro de noite até manhã.
- O one-hot dá uma coluna 0/1 por turno, sem ordem e sem distâncias inventadas.
'''),
md('**Para pensar:** no label encoding, “tarde” (2) é o dobro de “manhã” (1)? Que problema isso causa num modelo que faz contas com esses números?'),
nota('''
**Resposta esperada:** não. Um modelo linear multiplicaria o turno por um peso, como se “tarde” tivesse o dobro do efeito de “manhã”, o que não faz sentido.
Label encoding só é adequado para categorias com ordem real (ex.: fundamental < médio < superior), ou em árvores, que não fazem contas com o valor.
'''),
md('''
## Para discutir
1. Transformar os outliers em `NaN` ou dividir por 10: qual decisão você tomaria? O que muda nos dados?
2. Por que preencher os faltantes **dentro** do pipeline, e não antes do `train_test_split`?
3. Que outra coluna, num problema real, poderia “contar a resposta” como a `situacao`?
'''),
nota('''
**Pontos para a discussão:**
1. Dividir por 10 recupera o valor, se o palpite estiver certo; virar `NaN` é mais conservador e deixa o imputador preencher com a mediana. Note que o 15 escapou das duas abordagens.
2. Porque a mediana calculada antes do split usaria dados do teste: o mesmo vazamento da seção 4.4.
3. Exemplos: “cancelou o plano” para prever churn, data de alta para prever tempo de internação, “nota de recuperação” para prever reprovação.
'''),
]

# ================================================================== LAB 01
lab01 = [
md('''
# Lab 01 · Faça a reta aprender
**Machine Learning na Prática · Dia 1 · Módulo 02: Regressão Linear**

Os dados de alunos já chegam **limpos**, do jeito que você deixou no Lab 00. Agora o foco é o modelo:

| Etapa | O que fazer |
|---|---|
| 1. Olhar | carregar os dados prontos e visualizar horas × nota |
| 2. Ajustar | descida do gradiente com NumPy, acompanhar a MSE, comparar com `LinearRegression` |
| 3. Avaliar | prever alunos novos; MAE, MSE e R² no teste; regressão múltipla |
| 4. Taxa de aprendizado | convergência, lentidão e divergência |

Procure as células marcadas com **`# TODO`** e substitua os `___`.
'''),
*INSTALAR,
md('## 0 · Preparação (célula pronta)'),
code('''
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, PolynomialFeatures
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

plt.rcParams['figure.figsize'] = (8, 4)
'''),
md('''
### Os dados limpos do Lab 00
A célula abaixo gera os mesmos dados e aplica a **mesma limpeza** do Lab 00 (duplicados, turno, outliers, alvo faltante).
Se você ainda tem o arquivo `alunos_limpo.csv` do Lab 00 nesta sessão, ele é usado direto.
'''),
code(GERAR + '\n\n' + LIMPAR + '''

import os
df = pd.read_csv('alunos_limpo.csv') if os.path.exists('alunos_limpo.csv') else limpar(gerar_dados())
print(df.shape)
df.head()
'''),
nota('''
- `(392, 8)`: os mesmos 392 alunos do fim do Lab 00, com o turno já padronizado e sem os 3 outliers gritantes.
'''),
md('''
## 1 · Uma feature, uma reta
Começamos com o caso mais simples: prever `nota_final` só com `horas_estudo`.
Para esta parte, deixamos de fora as linhas sem horas (nas próximas etapas o `Pipeline` cuida delas).
'''),
code('''
d = df.dropna(subset=['horas_estudo'])
x_tr, x_te, y_tr, y_te = train_test_split(d['horas_estudo'].to_numpy(), d['nota_final'].to_numpy(),
                                          test_size=0.2, random_state=42)

# TODO: gráfico de dispersão horas × nota (treino)
plt.scatter(⟦x_tr⟧, ⟦y_tr⟧, alpha=.5)
plt.xlabel('horas de estudo'); plt.ylabel('nota final'); plt.show()
'''),
nota('''
- Sem os 21 faltantes em horas, sobram 371 alunos: **296 no treino e 75 no teste**.
- A nuvem sobe da esquerda para a direita, mas é larga. Uma reta vai capturar a tendência, não cada aluno.
- Repare no ponto isolado em **15 h com nota 0,4**, no canto inferior direito: é o erro de digitação (1,5 → 15) que a limpeza não pegou.
'''),
md('''
## 2 · Descida do gradiente com NumPy
O modelo é $\\hat y = w\\,x + b$ e a perda é a MSE: $L = \\frac{1}{n}\\sum (y - \\hat y)^2$.
As derivadas são:

$$\\frac{\\partial L}{\\partial w} = -\\frac{2}{n}\\sum x\\,(y-\\hat y) \\qquad \\frac{\\partial L}{\\partial b} = -\\frac{2}{n}\\sum (y-\\hat y)$$

e a atualização é $w \\leftarrow w - \\alpha \\, \\frac{\\partial L}{\\partial w}$ (o mesmo para $b$).
'''),
code('''
def descida_gradiente(x, y, alpha=0.02, epocas=3000):
    w, b = 0.0, 0.0
    historico = []
    for _ in range(epocas):
        # TODO: previsão da reta
        y_hat = ⟦w * x + b⟧
        erro = y - y_hat
        historico.append((erro ** 2).mean())          # MSE desta época
        # TODO: gradientes da MSE
        dw = ⟦-2 * (x * erro).mean()⟧
        db = ⟦-2 * erro.mean()⟧
        # TODO: passo contra o gradiente
        w = ⟦w - alpha * dw⟧
        b = ⟦b - alpha * db⟧
    return w, b, historico

w, b, hist = descida_gradiente(x_tr, y_tr)
print(f'w = {w:.3f} | b = {b:.3f} | MSE final = {hist[-1]:.3f}')

plt.plot(hist); plt.yscale('log')
plt.xlabel('época'); plt.ylabel('MSE (treino)'); plt.title('A perda caindo'); plt.show()
'''),
nota('''
- Resultado: **w ≈ 0,381** e **b ≈ 1,772**, com MSE final ≈ 1,235.
- **w**: cada hora a mais de estudo soma cerca de 0,38 ponto na nota prevista.
- **b**: a nota prevista para quem estuda 0 h. Ninguém nos dados estuda menos de 0,5 h, então é uma extrapolação.
- A curva da MSE cai rápido no começo e depois fica **plana**: a partir daí, mais épocas não ensinam nada.
'''),
md('Agora compare com a solução exata do Scikit-learn (mínimos quadrados):'),
code('''
# TODO: ajuste uma LinearRegression (ela espera X em 2D: x_tr.reshape(-1, 1))
reg = LinearRegression().⟦fit⟧(x_tr.reshape(-1, 1), y_tr)
print(f'Scikit-learn: w = {reg.coef_[0]:.3f} | b = {reg.intercept_:.3f}')
print(f'NumPy (GD):   w = {w:.3f} | b = {b:.3f}')

xs = np.linspace(0, 15, 100)
plt.scatter(x_tr, y_tr, alpha=.4)
plt.plot(xs, w * xs + b, 'C1', lw=3, label='descida do gradiente')
plt.plot(xs, reg.predict(xs.reshape(-1, 1)), 'k--', label='LinearRegression')
plt.legend(); plt.xlabel('horas'); plt.ylabel('nota'); plt.show()
'''),
nota('''
- Os dois chegam ao **mesmo w e b** (0,381 e 1,772). A descida do gradiente achou, passo a passo, a mesma resposta que o Scikit-learn calcula de uma vez.
- No gráfico, a reta laranja e a tracejada ficam uma em cima da outra.
'''),
md('''
**Curiosidade:** os dados foram gerados com uma regra escondida em que cada hora de estudo vale **+0,45** ponto.
O seu `w` chegou perto? Por que não é exatamente 0,45? (Dica: as outras colunas também mexem na nota.)
'''),
nota('''
**Resposta esperada:** parte é ruído (a nota tem uma parcela aleatória). Mas a maior parte é **um único ponto**: o aluno em 15 h com nota 0,4.
Ele está longe de todos no eixo x, e pontos assim têm muita “alavanca” sobre a reta. Tirando só ele, o `w` sobe de 0,381 para cerca de **0,43**.
É o mesmo outlier que escapou da regra `> 24` no Lab 00: um erro de limpeza vira erro de modelo.
'''),
md('''
## 3 · Prever e avaliar
### 3.1 Alunos novos
'''),
code('''
novos = np.array([2, 6, 10])
# TODO: use o modelo do Scikit-learn para prever as notas
for h, nota in zip(novos, reg.⟦predict⟧(novos.reshape(-1, 1))):
    print(f'{h:>2} h de estudo → nota prevista {nota:.2f}')
'''),
nota('''
- 2 h → **2,53**; 6 h → **4,06**; 10 h → **5,59**.
- A cada 4 horas a nota sobe 4 × 0,38 ≈ 1,53: a reta é linear.
- Nem com 10 h o modelo prevê aprovação (≥ 6), porque horas sozinhas não bastam: faltas, turno e monitoria também mexem na nota.
'''),
md('''
### 3.2 Métricas no teste
- **MAE**: erro médio na unidade original (pontos de nota)
- **MSE**: média dos erros ao quadrado (pune erros grandes)
- **R²**: quanto melhor que sempre chutar a média (1 = perfeito, 0 = igual à média, pode ser negativo)
'''),
code('''
pred = reg.predict(x_te.reshape(-1, 1))
# TODO: calcule as três métricas no TESTE
print(f'MAE = {⟦mean_absolute_error⟧(y_te, pred):.2f} ponto')
print(f'MSE = {⟦mean_squared_error⟧(y_te, pred):.2f}')
print(f'R²  = {⟦r2_score⟧(y_te, pred):.2f}')
'''),
nota('''
- **MAE = 0,79**: em média, a previsão erra cerca de 0,8 ponto para cima ou para baixo.
- **MSE = 0,97**: está em “pontos ao quadrado”, por isso é difícil de interpretar diretamente; serve para comparar modelos.
- **R² = 0,47**: só com horas, o modelo explica quase metade da variação das notas no teste. O resto vem das outras features e do ruído.
'''),
md('''
### 3.3 Regressão múltipla: todas as features
Agora usamos **todas** as colunas, com o preparo do Lab 00 já montado (célula pronta).
O modelo passa a ser $\\hat y = w_1 x_1 + w_2 x_2 + \\dots + b$. Comparamos pela **validação cruzada no treino**; o teste fica para o fim.
'''),
code('''
X = df.drop(columns=['nota_final', 'situacao'])
y = df['nota_final']
num, cat = ['horas_estudo', 'faltas', 'idade', 'renda_familiar'], ['turno', 'monitoria']
X_tr, X_te, Y_tr, Y_te = train_test_split(X, y, test_size=0.2, random_state=42)

preparo = ColumnTransformer([
    ('num', Pipeline([('imputar', SimpleImputer(strategy='median')), ('padronizar', StandardScaler())]), num),
    ('cat', OneHotEncoder(handle_unknown='ignore'), cat),
])
multipla = Pipeline([('preparo', preparo), ('regressao', LinearRegression())])
'''),
code('''
# TODO: MAE da validação cruzada (5 folds) só no treino
# (o Scikit-learn devolve o MAE com sinal negativo — por isso o "-" na frente)
mae_cv = -cross_val_score(multipla, X_tr, Y_tr, cv=⟦5⟧, scoring=⟦'neg_mean_absolute_error'⟧)
print(f'MAE na validação cruzada: {mae_cv.mean():.2f} ± {mae_cv.std():.2f}')

# TODO: treine no treino inteiro e avalie UMA vez no teste
multipla.fit(⟦X_tr⟧, ⟦Y_tr⟧)
pred = multipla.predict(X_te)
print(f'Teste → MAE = {mean_absolute_error(Y_te, pred):.2f} | R² = {r2_score(Y_te, pred):.2f}')
'''),
nota('''
- Validação cruzada: **MAE = 0,74 ± 0,06**. Teste: **MAE = 0,71** e **R² = 0,50**.
- Melhor que a reta só com horas (MAE 0,79 e R² 0,47): as outras features ajudam.
- O teste ficou dentro da faixa prevista pela validação cruzada. É isso que dá confiança de que o modelo generaliza.
- Atenção: os testes das seções 3.2 e 3.3 não são exatamente os mesmos alunos (aqui os faltantes não foram removidos), então a comparação é aproximada.
'''),
code('''
coefs = pd.Series(multipla.named_steps['regressao'].coef_,
                  index=multipla.named_steps['preparo'].get_feature_names_out()).round(2)
coefs.sort_values()
'''),
nota('''
- Maior peso: **`horas_estudo` (+0,84)**, depois **`faltas` (−0,39)** e **`turno_noite` (−0,36)**.
- `idade` (+0,07) e `renda_familiar` (−0,07) ficam perto de zero, como a correlação do Lab 00 indicava.
- `monitoria_sim` (+0,27) e `monitoria_não` (−0,27) são **espelhadas**: as duas colunas carregam a mesma informação. A diferença entre elas (0,54) é o efeito estimado da monitoria.
- Como as numéricas foram **padronizadas**, os coeficientes são comparáveis: +0,84 significa +0,84 ponto por **desvio-padrão** de horas (≈ 2,2 h), e não por hora.
'''),
md('**Para pensar:** quais coeficientes são maiores em módulo? Isso bate com a correlação que você viu no Lab 00? Coeficiente prova causa?'),
nota('''
**Resposta esperada:** horas, faltas e turno da noite; isso bate com a correlação (+0,62 e −0,31) e com as médias por turno do Lab 00.
Coeficiente **não prova causa**: ele mede associação nos dados. Só um experimento (ex.: sortear quem recebe monitoria) mostraria o efeito causal.
'''),
md('''
## 4 · A taxa de aprendizado
Rode a descida do gradiente com taxas diferentes e compare as curvas de perda.
'''),
code('''
# TODO: compare 4 taxas: 0.001 (pequena), 0.01 (boa), 0.023 (quase no limite) e 0.03 (grande demais)
for alpha in [⟦0.001⟧, ⟦0.01⟧, ⟦0.023⟧, ⟦0.03⟧]:
    _, _, h = descida_gradiente(x_tr, y_tr, alpha=alpha, epocas=300)
    plt.plot(np.clip(h, None, 1e3), label=f'α = {alpha}')
plt.yscale('log'); plt.xlabel('época'); plt.ylabel('MSE (treino)')
plt.legend(); plt.show()
'''),
nota('''
Valores depois das 300 épocas (a reta “certa” é w ≈ 0,381 e b ≈ 1,772):

| α | w | b | o que acontece |
|---|---|---|---|
| 0,001 | 0,61 | 0,20 | **lento**: a MSE mal saiu do lugar e `b` quase não foi aprendido |
| 0,01 | 0,51 | 0,93 | desce bem, mas ainda **não convergiu** em 300 épocas |
| 0,023 | 0,43 | 1,43 | a mais rápida, quase no limite |
| 0,03 | ≈ −10⁵³ | ≈ −10⁵² | **diverge**: a MSE explode (o gráfico corta em 1 000) |

- Para estes dados, o limite teórico é α ≈ 0,024. Acima dele, cada passo **ultrapassa** o mínimo por mais do que estava antes, e o erro cresce a cada época.
- Com α = 0,023, o `w` **oscila**: 1,21 → 0,09 → 1,12 → 0,17 → … pulando de um lado para o outro do mínimo, enquanto a MSE ainda cai. A oscilação está nos parâmetros, não na curva.
'''),
md('''
**Para pensar:** qual curva desce devagar? Qual oscila? Qual explode (diverge)?
O que acontece com `w` quando a taxa é grande demais?
'''),
nota('''
**Resposta esperada:** α = 0,001 desce devagar; α = 0,023 oscila nos parâmetros (vai e volta em torno do mínimo); α = 0,03 diverge.
Com taxa grande demais, o `w` troca de sinal e cresce em módulo a cada época, até números astronômicos.
'''),
md('''
## 5 · Desafio extra: regularização
Um polinômio de grau alto em `horas_estudo` pode decorar o treino. A regressão **Ridge** soma à perda a penalidade
$\\lambda \\sum w^2$ (no Scikit-learn, $\\lambda$ se chama `alpha`). Compare pela validação cruzada.
'''),
code('''
def poli(lam):
    passos = [('poli', PolynomialFeatures(degree=10)), ('padronizar', StandardScaler())]
    passos.append(('reg', LinearRegression() if lam == 0 else Ridge(alpha=lam)))
    return Pipeline(passos)

for lam in [0, 0.1, 10, 1000]:
    # TODO: MAE médio da validação cruzada (cv=5) para cada λ
    mae = -cross_val_score(poli(lam), x_tr.reshape(-1, 1), y_tr, cv=5,
                           scoring=⟦'neg_mean_absolute_error'⟧).mean()
    print(f'λ = {lam:>6}: MAE = {mae:.3f}')
'''),
nota('''
| λ | MAE (validação cruzada) | leitura |
|---|---|---|
| 0 | **2,60** | polinômio de grau 10 sem freio: decora o treino e erra feio em dados novos |
| 0,1 | **0,825** | melhor: a penalidade “alisa” a curva |
| 10 | 0,845 | ainda bom |
| 1000 | 0,992 | freio demais: a curva fica quase reta e horizontal (subajuste) |

- Nenhum polinômio regularizado bate a **reta simples** (MAE ≈ 0,79): a relação real é linear, e complexidade extra não paga.
'''),
md('''
## Para discutir
1. O modelo aprende com o **número de épocas** ou com a **atualização guiada pelo erro**?
2. O MAE de ~0,7 ponto é bom ou ruim? Depende de quê?
3. Por que a regressão múltipla erra menos que a reta só com horas?
'''),
nota('''
**Pontos para a discussão:**
1. Com a atualização guiada pelo erro. Épocas são só repetições: se o passo for ruim, mais épocas não ajudam (α = 0,03).
2. Depende da escala e do uso. Numa nota de 0 a 10, 0,7 ponto é razoável para orientar um aluno, mas não para decidir aprovação perto do 6.
3. Porque faltas, turno e monitoria explicam parte da nota que as horas não explicam. O R² sobe de 0,47 para 0,50.
'''),
]

# ================================================================== LAB 02
lab02 = [
md('''
# Lab 02 · Mesmos dados. Três algoritmos
**Machine Learning na Prática · Dia 1 · Módulo 03: KNN, Árvores & Random Forest**

Os dados já chegam **prontos**: o clássico **Iris** (150 flores, 4 medidas, 3 espécies), sem faltantes nem sujeira.
O foco é comparar classificadores com honestidade.

| Etapa | O que fazer |
|---|---|
| 1. Olhar e separar | explorar o Iris e separar treino/teste com estratificação |
| 2. Comparar | KNN × Árvore × Random Forest com validação cruzada no treino |
| 3. Ajustar | variar K e profundidade: qualidade e variância |
| 4. Avaliar | o escolhido no teste: matriz de confusão e métricas |

Procure as células marcadas com **`# TODO`** e substitua os `___`.
'''),
*INSTALAR,
md('## 0 · Preparação (célula pronta)'),
code('''
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.datasets import load_iris, load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import ConfusionMatrixDisplay, classification_report, precision_score, recall_score

plt.rcParams['figure.figsize'] = (8, 4)

iris = load_iris(as_frame=True)
X, y = iris.data, iris.target
nomes = iris.target_names
X.head()
'''),
nota('''
- 4 medidas em centímetros por flor, todas na mesma ordem de grandeza.
- O alvo `target` vale 0, 1 ou 2 (setosa, versicolor, virginica).
'''),
md('## 1 · Olhar e separar'),
code('''
# TODO: quantas flores de cada espécie?
print(y.⟦value_counts⟧())

plt.scatter(X['petal length (cm)'], X['petal width (cm)'], c=y, cmap='viridis', alpha=.8)
plt.xlabel('comprimento da pétala'); plt.ylabel('largura da pétala'); plt.show()
'''),
nota('''
- **50 flores de cada espécie**: classes perfeitamente balanceadas, então a acurácia é uma métrica honesta aqui.
- No gráfico de pétalas, a **setosa** forma um grupo isolado (pétalas pequenas). **Versicolor e virginica** se encostam: é ali que os modelos vão errar.
'''),
md('''
**Estratificar** mantém a mesma proporção de espécies no treino e no teste — importante quando há poucas amostras.
'''),
code('''
# TODO: 25% para teste, estratificando pelo alvo
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=⟦y⟧)
print(y_tr.value_counts().to_dict(), y_te.value_counts().to_dict())
'''),
nota('''
- Treino: 38 / 37 / 37. Teste: 12 / 13 / 13.
- As proporções se mantêm (≈ 1/3 de cada). Sem estratificar, o teste de 38 flores poderia, por azar, ficar com pouquíssimas de uma espécie.
'''),
md('''
## 2 · KNN × Árvore × Random Forest
O KNN usa **distâncias**, então vai num `Pipeline` com padronização. Árvores não ligam para escala.
Comparamos pela **acurácia média da validação cruzada no treino**.
'''),
code('''
modelos = {
    # TODO: KNN com padronização dentro do pipeline
    'KNN (K=5)': Pipeline([('padronizar', ⟦StandardScaler()⟧), ('knn', KNeighborsClassifier(n_neighbors=5))]),
    'Árvore': DecisionTreeClassifier(random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=200, random_state=42),
}

for nome, modelo in modelos.items():
    # TODO: acurácia da validação cruzada com 5 folds, só no treino
    acc = cross_val_score(modelo, ⟦X_tr⟧, ⟦y_tr⟧, cv=⟦5⟧, scoring='accuracy')
    print(f'{nome:<14} {acc.mean():.3f} ± {acc.std():.3f}')
'''),
nota('''
- KNN **0,946 ± 0,034**; árvore **0,929 ± 0,044**; random forest **0,946 ± 0,034**.
- As diferenças são **menores que o desvio** entre folds: estatisticamente, os três empatam neste problema.
- A árvore única é a mais instável (maior desvio), e a floresta reduz essa variância ao combinar 200 árvores.
'''),
md('''
## 3 · Variar K e profundidade
Compare a acurácia **no treino** com a da **validação cruzada**. Quando as duas se afastam, o modelo está decorando.
'''),
code('''
def treino_vs_cv(modelo):
    acc_tr = modelo.fit(X_tr, y_tr).score(X_tr, y_tr)
    acc_cv = cross_val_score(modelo, X_tr, y_tr, cv=5).mean()
    return acc_tr, acc_cv

ks = [1, 3, 5, 9, 15, 31, 61]
# TODO: monte o KNN com K = k
res_k = [treino_vs_cv(Pipeline([('padronizar', StandardScaler()), ('knn', KNeighborsClassifier(n_neighbors=⟦k⟧))])) for k in ks]

profs = [1, 2, 3, 4, 6, None]
# TODO: monte a árvore com profundidade máxima = p
res_p = [treino_vs_cv(DecisionTreeClassifier(max_depth=⟦p⟧, random_state=42)) for p in profs]

fig, ax = plt.subplots(1, 2, figsize=(12, 4))
ax[0].plot(ks, [r[0] for r in res_k], 'o-', label='treino'); ax[0].plot(ks, [r[1] for r in res_k], 'o-', label='validação cruzada')
ax[0].set_xscale('log'); ax[0].set_xlabel('K'); ax[0].set_title('KNN'); ax[0].legend()
rot = [str(p) for p in profs]
ax[1].plot(rot, [r[0] for r in res_p], 'o-', label='treino'); ax[1].plot(rot, [r[1] for r in res_p], 'o-', label='validação cruzada')
ax[1].set_xlabel('profundidade máxima'); ax[1].set_title('Árvore'); ax[1].legend()
plt.show()
'''),
nota('''
**KNN:** K = 1 dá 100% no treino, mas 0,946 na validação cruzada. Entre K = 3 e 15, a validação fica estável em ≈ 0,95. Com K = 31 e 61, as duas curvas **caem juntas** (0,87 e 0,73): o modelo ficou simples demais.

**Árvore:** profundidade 1 = 0,65 (uma pergunta só separa 2 das 3 espécies). Com profundidade 2 ou 3, a validação chega a ≈ 0,93–0,94. De 4 em diante, o treino vai a 99–100% e a validação **não melhora** (0,93).

- **Sobreajuste**: a distância entre treino e validação aumenta. **Subajuste**: as duas curvas ficam baixas.
'''),
md('''
**Para pensar:** com K = 1 e com a árvore sem limite (`None`), a acurácia no treino é 100%. Isso significa que são os melhores modelos?
'''),
nota('''
**Resposta esperada:** não. 100% no treino com K = 1 é trivial: cada flor é a própria vizinha mais próxima.
A árvore sem limite cresce até separar cada ponto. O que importa é a validação cruzada, e nela esses modelos não são os melhores.
'''),
code('''
arvore = DecisionTreeClassifier(max_depth=2, random_state=42).fit(X_tr, y_tr)
plt.figure(figsize=(10, 5))
plot_tree(arvore, feature_names=X.columns, class_names=nomes, filled=True); plt.show()
'''),
nota('''
- A árvore inteira cabe em **duas perguntas**, e as duas são sobre `petal length (cm)`:
  - comprimento da pétala ≤ 2,45 → **setosa** (nó puro);
  - senão, ≤ 4,85 → **versicolor**, e acima disso → **virginica**.
- As sépalas nem aparecem: a árvore escolheu sozinha a feature mais informativa.
- Com só 2 níveis, ela acerta 96% do treino. É um modelo que dá para **explicar** a qualquer pessoa.
'''),
md('''
## 4 · Avaliar o escolhido no teste
Escolha um modelo **pela validação cruzada** (não pelo teste!). Só agora o teste é usado — uma única vez.
'''),
code('''
# TODO: escolha o modelo (ex.: modelos['Random Forest']) e treine no treino inteiro
escolhido = ⟦modelos['Random Forest']⟧.fit(X_tr, y_tr)
pred = escolhido.predict(X_te)

ConfusionMatrixDisplay.from_predictions(y_te, pred, display_labels=nomes); plt.show()
# TODO: precision, recall e F1 por classe
print(⟦classification_report⟧(y_te, pred, target_names=nomes))
'''),
nota('''
Matriz de confusão (linhas = real, colunas = previsto):

| | setosa | versicolor | virginica |
|---|---|---|---|
| **setosa** | 12 | 0 | 0 |
| **versicolor** | 0 | 12 | 1 |
| **virginica** | 0 | 3 | 10 |

- Acurácia no teste: **0,89** (34 de 38), um pouco abaixo da validação cruzada (0,946). Com só 38 flores, cada erro vale 2,6 pontos percentuais.
- A setosa nunca erra. **Todos os 4 erros** são entre versicolor e virginica, justamente as espécies que se encostam no gráfico.
- Virginica tem recall 0,77: 3 das 13 foram chamadas de versicolor. Versicolor tem precision 0,80, porque recebeu esses 3 “intrusos”.
'''),
md('''
## 5 · Desafios extras (se sobrar tempo)
### 5.1 Precision × recall: quem escolhe é o limiar
No Iris tudo é fácil. Num problema médico, errar um caso positivo custa caro.
Use o dataset de **câncer de mama** do Scikit-learn (positivo = tumor maligno) e veja o efeito do limiar.
'''),
code('''
bc = load_breast_cancer()
Xb, yb = bc.data, (bc.target == 0).astype(int)          # 1 = maligno
Xb_tr, Xb_te, yb_tr, yb_te = train_test_split(Xb, yb, test_size=0.25, random_state=42, stratify=yb)
rf = RandomForestClassifier(n_estimators=200, random_state=42).fit(Xb_tr, yb_tr)
proba = rf.predict_proba(Xb_te)[:, 1]                    # probabilidade de ser maligno

for limiar in [0.2, 0.35, 0.5, 0.65, 0.8]:
    # TODO: positivo quando a probabilidade passa do limiar
    prev = (proba >= ⟦limiar⟧).astype(int)
    print(f'limiar {limiar:.2f} → precision {precision_score(yb_te, prev):.2f} | recall {recall_score(yb_te, prev):.2f}')
'''),
nota('''
São **53 tumores malignos** entre os 143 casos do teste.

| limiar | malignos perdidos | alarmes falsos |
|---|---|---|
| 0,20 | 1 | 7 |
| 0,50 | 6 | 0 |
| 0,80 | 14 | 0 |

- **Baixar o limiar** aumenta o recall (pega quase todos os malignos) ao custo de mais alarmes falsos (a precision cai).
- **Subir o limiar** faz o contrário: o modelo só aponta quando tem certeza e perde muitos casos.
- O 0,5 padrão **não é sagrado**: o limiar é uma decisão do problema, não do modelo.
'''),
md('**Para pensar:** numa triagem de câncer, você prefere limiar alto ou baixo? E num filtro de spam?'),
nota('''
**Resposta esperada:** na triagem de câncer, **limiar baixo**: perder um maligno custa muito mais caro que um exame extra.
No filtro de spam, **limiar alto**: mandar um e-mail importante para o spam é pior que deixar passar uma propaganda.
'''),
md('''
### 5.2 “Perto” depende de como você mede
O KNN usa a distância euclidiana por padrão. Compare com a de Manhattan.
'''),
code('''
for metrica in ['euclidean', 'manhattan']:
    # TODO: passe a métrica para o KNN
    knn = Pipeline([('padronizar', StandardScaler()), ('knn', KNeighborsClassifier(n_neighbors=5, metric=⟦metrica⟧))])
    print(metrica, cross_val_score(knn, X_tr, y_tr, cv=5).mean().round(3))
'''),
nota('''
- **0,946 nas duas**: aqui a métrica não fez diferença.
- Com só 4 features padronizadas, os vizinhos mais próximos tendem a ser os mesmos nas duas distâncias. A diferença costuma aparecer com muitas features ou com outliers (Manhattan é menos sensível a uma diferença grande numa única coordenada).
'''),
md('''
## Para discutir
1. O modelo que foi melhor **no treino** deve necessariamente ser o escolhido?
2. Por que escolher pela validação cruzada e só depois olhar o teste?
3. Onde o modelo errou na matriz de confusão? Essas espécies se parecem no gráfico de pétalas?
'''),
nota('''
**Pontos para a discussão:**
1. Não. Ir bem no treino pode ser decoreba (K = 1, árvore sem limite). Escolhe-se pela validação cruzada.
2. Se o teste for usado para escolher, ele vira parte do treino e deixa de medir o desempenho em dados novos: a nota final sai otimista.
3. Todos os erros foram entre versicolor e virginica, que se sobrepõem no gráfico de pétalas. A setosa, isolada, nunca erra.
'''),
]

save('00_dados_e_datasets', lab00)
save('01_regressao_linear', lab01)
save('02_classificacao', lab02)
