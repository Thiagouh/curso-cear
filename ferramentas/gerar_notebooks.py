"""Gera os notebooks dos labs do dia 1 (versão do aluno + gabarito).
Em células de código, ⟦solução⟧ vira ___ na versão do aluno e a solução no gabarito."""
import json, re, sys, os

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'notebooks')
GAB_NOTE = '\n\n> **Gabarito.** Versão do professor, com todas as células resolvidas. Não compartilhe antes da atividade.'


def md(s): return ('md', s.strip('\n'))
def code(s): return ('code', s.strip('\n'))


def render(cells, gab):
    out = []
    for i, (kind, src) in enumerate(cells):
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

# ================================================================== LAB 00
lab00 = [
md('''
# Lab 00 · Arrume a casa antes de modelar
**Machine Learning na Prática · Dia 1 · Módulo 01: Dados & Datasets** · ~35 min

Neste notebook você vai fazer o que todo projeto de ML faz **antes** de treinar qualquer modelo.
Aqui **não há modelo nem métricas**: o objetivo é deixar os dados prontos. O treino começa no Lab 01, já com estes dados limpos.

| Etapa | O que fazer | Tempo |
|---|---|---|
| 1. Inspecionar | formato, tipos, estatísticas, faltantes | 8 min |
| 2. Limpar | duplicados, categorias, outliers, alvo faltante | 10 min |
| 3. Explorar | histogramas, boxplot, correlação | 8 min |
| 4. Preparar | features × alvo, split, one-hot, padronização e `Pipeline` sem vazamento | 9 min |

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
code('''
# TODO: quantas linhas e colunas? E quais os tipos de cada coluna?
print(df.⟦shape⟧)
df.⟦info⟧()
'''),
code('''
# TODO: estatísticas das colunas numéricas. Repare no máximo de horas_estudo!
df.⟦describe⟧()
'''),
code('''
# TODO: quantos valores faltantes há em cada coluna?
df.⟦isna⟧().sum()
'''),
code('''
# TODO: quais valores aparecem na coluna 'turno'?
df['turno'].⟦value_counts⟧()
'''),
md('''
**Para pensar:** liste os problemas que você encontrou. Quais colunas têm faltantes? O que há de estranho em `turno` e em `horas_estudo`?

*Sua resposta:* …
'''),
md('## 2 · Limpar'),
md('### 2.1 Duplicados'),
code('''
# TODO: conte as linhas duplicadas e remova-as
print('duplicados:', df.duplicated().⟦sum⟧())
df = df.⟦drop_duplicates⟧()
print('linhas agora:', len(df))
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
md('## 3 · Explorar'),
code('''
# TODO: histogramas de todas as colunas numéricas
df.⟦hist⟧(bins=20, figsize=(12, 6))
plt.tight_layout(); plt.show()
'''),
md('**Média × mediana:** compare as duas para `horas_estudo` e para `renda_familiar`. Em qual delas a diferença é maior? Por quê?'),
code('''
for col in ['horas_estudo', 'renda_familiar']:
    # TODO: calcule a média e a mediana da coluna
    print(f"{col}: média = {df[col].⟦mean⟧():.1f} | mediana = {df[col].⟦median⟧():.1f}")
'''),
code('''
# TODO: gráfico de dispersão horas_estudo × nota_final
plt.scatter(df[⟦'horas_estudo'⟧], df[⟦'nota_final'⟧], alpha=.5)
plt.xlabel('horas de estudo'); plt.ylabel('nota final'); plt.show()
'''),
code('''
# TODO: correlação entre as colunas numéricas
df.⟦corr⟧(numeric_only=True).round(2)
'''),
code('''
# TODO: nota média por turno e por monitoria
df.groupby(⟦['turno', 'monitoria']⟧)['nota_final'].mean().round(2)
'''),
md('''
**Para pensar:** quais features parecem ajudar a prever a nota? Alguma parece não ter relação nenhuma?
Lembre: correlação não é causalidade.

*Sua resposta:* …
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
code('''
alvo = 'nota_final'
# TODO: escolha as features (todas menos o alvo e a coluna que vaza)
X = df.drop(columns=[alvo, ⟦'situacao'⟧])
y = df[alvo]

num = ['horas_estudo', 'faltas', 'idade', 'renda_familiar']
cat = ['turno', 'monitoria']
X.head()
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
md('''
### 4.5 Salvar os dados limpos
O Lab 01 começa exatamente daqui, com esta versão limpa.
'''),
code('''
df.to_csv('alunos_limpo.csv', index=False)
print(df.shape, '→ alunos_limpo.csv')
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
md('**Para pensar:** sem padronizar, qual coluna decidiu quem é “parecido”? Por quê?'),
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
md('**Para pensar:** no label encoding, “tarde” (2) é o dobro de “manhã” (1)? Que problema isso causa num modelo que faz contas com esses números?'),
md('''
## Para discutir
1. Transformar os outliers em `NaN` ou dividir por 10: qual decisão você tomaria? O que muda nos dados?
2. Por que preencher os faltantes **dentro** do pipeline, e não antes do `train_test_split`?
3. Que outra coluna, num problema real, poderia “contar a resposta” como a `situacao`?
'''),
]

# ================================================================== LAB 01
lab01 = [
md('''
# Lab 01 · Faça a reta aprender
**Machine Learning na Prática · Dia 1 · Módulo 02: Regressão Linear** · ~25 min

Os dados de alunos já chegam **limpos**, do jeito que você deixou no Lab 00. Agora o foco é o modelo:

| Etapa | O que fazer | Tempo |
|---|---|---|
| 1. Olhar | carregar os dados prontos e visualizar horas × nota | 5 min |
| 2. Ajustar | descida do gradiente com NumPy, acompanhar a MSE, comparar com `LinearRegression` | 10 min |
| 3. Avaliar | prever alunos novos; MAE, MSE e R² no teste; regressão múltipla | 5 min |
| 4. Taxa de aprendizado | convergência, lentidão e divergência | 5 min |

Procure as células marcadas com **`# TODO`** e substitua os `___`.
'''),
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
md('''
**Curiosidade:** os dados foram gerados com uma regra escondida em que cada hora de estudo vale **+0,45** ponto.
O seu `w` chegou perto? Por que não é exatamente 0,45? (Dica: as outras colunas também mexem na nota.)
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
code('''
coefs = pd.Series(multipla.named_steps['regressao'].coef_,
                  index=multipla.named_steps['preparo'].get_feature_names_out()).round(2)
coefs.sort_values()
'''),
md('**Para pensar:** quais coeficientes são maiores em módulo? Isso bate com a correlação que você viu no Lab 00? Coeficiente prova causa?'),
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
md('''
**Para pensar:** qual curva desce devagar? Qual oscila? Qual explode (diverge)?
O que acontece com `w` quando a taxa é grande demais?
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
md('''
## Para discutir
1. O modelo aprende com o **número de épocas** ou com a **atualização guiada pelo erro**?
2. O MAE de ~0,7 ponto é bom ou ruim? Depende de quê?
3. Por que a regressão múltipla erra menos que a reta só com horas?
'''),
]

# ================================================================== LAB 02
lab02 = [
md('''
# Lab 02 · Mesmos dados. Três algoritmos
**Machine Learning na Prática · Dia 1 · Módulo 03: KNN, Árvores & Random Forest** · ~25 min

Os dados já chegam **prontos**: o clássico **Iris** (150 flores, 4 medidas, 3 espécies), sem faltantes nem sujeira.
O foco é comparar classificadores com honestidade.

| Etapa | O que fazer | Tempo |
|---|---|---|
| 1. Olhar e separar | explorar o Iris e separar treino/teste com estratificação | 5 min |
| 2. Comparar | KNN × Árvore × Random Forest com validação cruzada no treino | 8 min |
| 3. Ajustar | variar K e profundidade: qualidade e variância | 7 min |
| 4. Avaliar | o escolhido no teste: matriz de confusão e métricas | 5 min |

Procure as células marcadas com **`# TODO`** e substitua os `___`.
'''),
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
md('## 1 · Olhar e separar'),
code('''
# TODO: quantas flores de cada espécie?
print(y.⟦value_counts⟧())

plt.scatter(X['petal length (cm)'], X['petal width (cm)'], c=y, cmap='viridis', alpha=.8)
plt.xlabel('comprimento da pétala'); plt.ylabel('largura da pétala'); plt.show()
'''),
md('''
**Estratificar** mantém a mesma proporção de espécies no treino e no teste — importante quando há poucas amostras.
'''),
code('''
# TODO: 25% para teste, estratificando pelo alvo
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=⟦y⟧)
print(y_tr.value_counts().to_dict(), y_te.value_counts().to_dict())
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
md('''
**Para pensar:** com K = 1 e com a árvore sem limite (`None`), a acurácia no treino é 100%. Isso significa que são os melhores modelos?
'''),
code('''
arvore = DecisionTreeClassifier(max_depth=2, random_state=42).fit(X_tr, y_tr)
plt.figure(figsize=(10, 5))
plot_tree(arvore, feature_names=X.columns, class_names=nomes, filled=True); plt.show()
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
md('**Para pensar:** numa triagem de câncer, você prefere limiar alto ou baixo? E num filtro de spam?'),
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
md('''
## Para discutir
1. O modelo que foi melhor **no treino** deve necessariamente ser o escolhido?
2. Por que escolher pela validação cruzada e só depois olhar o teste?
3. Onde o modelo errou na matriz de confusão? Essas espécies se parecem no gráfico de pétalas?
'''),
]

save('00_dados_e_datasets', lab00)
save('01_regressao_linear', lab01)
save('02_classificacao', lab02)
