import type { Cartao, Estado, Materia, Questao, Tema } from '../tipos'
import { diffDias, hojeISO } from './datas'
import { CAIXA_CONSOLIDADO } from './repeticao'

/** Janela do recorte temporal do relatório. */
export const JANELA_DIAS = 30

export interface Recorte {
  id: string
  rotulo: string
  respondidas: number
  acertos: number
  percentual: number
}

export interface ErroParaRevisar {
  questao: Questao
  vezes: number
  ultimoErro: string
}

export interface Resumo {
  sequenciaAtual: number
  sequenciaRecorde: number
  respondidas: number
  acertos: number
  percentual: number | null
  consolidados: number
  totalCartoes: number
  emRevisao: number
  temas: Recorte[]
  materias: Recorte[]
  janela: { dias: number; questoes: number; acertos: number; cartoes: number; percentual: number | null }
  erros: ErroParaRevisar[]
}

function comPercentual(id: string, rotulo: string, respondidas: number, acertos: number): Recorte {
  return {
    id,
    rotulo,
    respondidas,
    acertos,
    percentual: respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0,
  }
}

export function resumir(
  estado: Estado,
  cartoes: Cartao[],
  temas: Tema[],
  materias: Materia[],
  questoes: Questao[],
): Resumo {
  let respondidas = 0
  let acertos = 0
  for (const contagem of Object.values(estado.porTema)) {
    respondidas += contagem.respondidas
    acertos += contagem.acertos
  }

  const estadosCartao = Object.values(estado.cartoes)
  const consolidados = estadosCartao.filter((c) => c.caixa >= CAIXA_CONSOLIDADO).length
  const emRevisao = estadosCartao.filter((c) => c.caixa > 0 && c.caixa < CAIXA_CONSOLIDADO).length

  const recorteTemas = temas
    .map((tema) => {
      const c = estado.porTema[tema.id] ?? { respondidas: 0, acertos: 0 }
      return comPercentual(tema.id, tema.rotulo, c.respondidas, c.acertos)
    })
    .filter((t) => t.respondidas > 0)
    .sort((a, b) => a.percentual - b.percentual || b.respondidas - a.respondidas)

  // Matéria é a soma dos seus temas — não exige contador próprio no estado salvo.
  const materiaDoTema = new Map(temas.map((t) => [t.id, t.materia]))
  const recorteMaterias = materias
    .map((materia) => {
      let r = 0
      let a = 0
      for (const [temaId, contagem] of Object.entries(estado.porTema)) {
        if (materiaDoTema.get(temaId) !== materia.id) continue
        r += contagem.respondidas
        a += contagem.acertos
      }
      return comPercentual(materia.id, materia.curto, r, a)
    })
    .filter((m) => m.respondidas > 0)
    .sort((a, b) => a.percentual - b.percentual || b.respondidas - a.respondidas)

  const hoje = hojeISO()
  let jq = 0
  let ja = 0
  let jc = 0
  let jd = 0
  for (const [data, registro] of Object.entries(estado.dias)) {
    const atras = -diffDias(hoje, data)
    if (atras < 0 || atras >= JANELA_DIAS) continue
    jq += registro.questoes
    ja += registro.acertos
    jc += registro.cartoes
    if (registro.questoes > 0 || registro.cartoes > 0) jd++
  }

  const porId = new Map(questoes.map((q) => [q.id, q]))
  const erros: ErroParaRevisar[] = Object.entries(estado.erros)
    .map(([id, registro]) => {
      const questao = porId.get(id)
      return questao ? { questao, vezes: registro.vezes, ultimoErro: registro.ultimoErro } : null
    })
    .filter((e): e is ErroParaRevisar => e !== null)
    .sort((a, b) => b.vezes - a.vezes || b.ultimoErro.localeCompare(a.ultimoErro))

  return {
    sequenciaAtual: estado.sequencia.atual,
    sequenciaRecorde: estado.sequencia.recorde,
    respondidas,
    acertos,
    percentual: respondidas > 0 ? Math.round((acertos / respondidas) * 100) : null,
    consolidados,
    totalCartoes: cartoes.length,
    emRevisao,
    temas: recorteTemas,
    materias: recorteMaterias,
    janela: {
      dias: jd,
      questoes: jq,
      acertos: ja,
      cartoes: jc,
      percentual: jq > 0 ? Math.round((ja / jq) * 100) : null,
    },
    erros,
  }
}
