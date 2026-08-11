# Estudo — Diretor de Escola, Limeira/SP

App de estudo mobile-first para o concurso de Diretor de Escola da Prefeitura de Limeira/SP
(banca AVANÇASP, prova em 13/12/2026). Uso pessoal, um único usuário, sem backend.

Abre direto na primeira questão do dia: sem menu, sem escolha, sem configuração.

## Rodar

Requer Node.js 18+.

```bash
npm install
```

```bash
npm run dev
```

Build estático para deploy:

```bash
npm run build
```

A saída fica em `dist/` e pode ser servida por qualquer host estático. O `base` está
como `./`, então funciona tanto na raiz quanto em subpasta.

## Estrutura

```
src/
├── data/            ← conteúdo: edite só aqui para acrescentar itens
│   ├── questoes.json
│   ├── cartoes.json
│   └── temas.json
├── nucleo/          ← regras (datas, sorteio, repetição espaçada, estado)
├── telas/           ← Hoje, Cartões, Progresso
└── componentes/
```

## Acrescentar conteúdo

Basta editar os JSON — o app não precisa de nenhuma alteração de código.

**Nova questão** em `src/data/questoes.json`, dentro do array `questoes`:

```json
{
  "id": "leg-041",
  "materia": "legislacao",
  "tema": "ldb",
  "enunciado": "...",
  "alternativas": ["...", "...", "...", "..."],
  "gabarito": 2,
  "comentario": "...",
  "fonte": "opcional"
}
```

- `gabarito` é **índice 0-based**: `0` = A, `1` = B, `2` = C…
- `alternativas` aceita 4 ou 5 itens.
- `id` precisa ser único e estável — o progresso salvo aponta para ele.
- `\n\n` no comentário vira parágrafo; `\n` vira quebra de linha.

**Novo cartão** em `src/data/cartoes.json`: mesma ideia, com `frente` e `verso`.

**Novo tema** em `src/data/temas.json`: acrescente em `temas` com `id`, `materia` e `rotulo`.
O `id` do tema é o que liga questões e cartões — errar uma questão de `ldb` antecipa
um cartão de `ldb`.

Questões acrescentadas depois entram no fim da fila do dia sem embaralhar o que já passou.

## Como o app decide o que mostrar

**Hoje** — 3 questões por dia, tiradas de uma ordem embaralhada uma única vez com semente
fixa e estratificada por matéria (as 3 do dia raramente caem no mesmo assunto). Recarregar
a página devolve exatamente as mesmas questões. Esgotado o banco, começa uma nova rodada
com outra ordem.

**Cartões** — repetição espaçada em 6 caixas, com intervalos de 1, 3, 7, 16, 35 e 75 dias.
*Sabia* sobe uma caixa; *Difícil* mantém a caixa; *Errei* volta à caixa 0 e reagenda para
hoje, reaparecendo no fim da fila. Só aparecem os cartões devidos, mais até 5 inéditos por dia.

**Erro vira revisão** — ao errar uma questão, o app antecipa para hoje um cartão do mesmo
tema, preferindo o que você nunca viu, depois o menos consolidado. Sem confirmação e sem aviso.

**Sequência** — um dia entra na contagem quando você conclui as 3 questões ou revisa ao
menos um cartão.

Constantes ajustáveis em `src/nucleo/repeticao.ts` (`INTERVALOS`, `NOVOS_POR_DIA`,
`CAIXA_CONSOLIDADO`) e `src/nucleo/questoesDoDia.ts` (`QUESTOES_POR_DIA`).

## Fontes

O projeto usa Archivo (títulos e interface) e Source Serif 4 (corpo). Para funcionar
offline elas precisam ser auto-hospedadas: baixe os `.woff2` variáveis e coloque em

```
public/fontes/archivo-variable.woff2
public/fontes/source-serif-4-variable.woff2
```

Sem esses arquivos o app funciona normalmente, usando as fontes de sistema declaradas
como fallback em `tailwind.config.js`.

## Ícones

Já gerados em `public/`. Para refazer:

```bash
node scripts/gerar-icones.mjs
```

## Dados salvos

Tudo em `localStorage`, chave `estudo:v1`. Limpar os dados do site zera o progresso.
