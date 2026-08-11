import type { Cartao, Estado, Tema } from '../tipos'
import { CAIXA_CONSOLIDADO } from './repeticao'

export interface RecorteTema {
  id: string
  rotulo: string
  respondidas: number
  acertos: number
  percentual: number
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
  temas: RecorteTema[]
}

export function resumir(estado: Estado, cartoes: Cartao[], temas: Tema[]): Resumo {
  let respondidas = 0
  let acertos = 0
  for (const contagem of Object.values(estado.porTema)) {
    respondidas += contagem.respondidas
    acertos += contagem.acertos
  }

  const estadosCartao = Object.values(estado.cartoes)
  const consolidados = estadosCartao.filter((c) => c.caixa >= CAIXA_CONSOLIDADO).length
  const emRevisao = estadosCartao.filter(
    (c) => c.caixa > 0 && c.caixa < CAIXA_CONSOLIDADO,
  ).length

  const recorte: RecorteTema[] = temas
    .map((tema) => {
      const contagem = estado.porTema[tema.id] ?? { respondidas: 0, acertos: 0 }
      return {
        id: tema.id,
        rotulo: tema.rotulo,
        respondidas: contagem.respondidas,
        acertos: contagem.acertos,
        percentual:
          contagem.respondidas > 0
            ? Math.round((contagem.acertos / contagem.respondidas) * 100)
            : 0,
      }
    })
    .filter((t) => t.respondidas > 0)
    .sort((a, b) => a.percentual - b.percentual || b.respondidas - a.respondidas)

  return {
    sequenciaAtual: estado.sequencia.atual,
    sequenciaRecorde: estado.sequencia.recorde,
    respondidas,
    acertos,
    percentual: respondidas > 0 ? Math.round((acertos / respondidas) * 100) : null,
    consolidados,
    totalCartoes: cartoes.length,
    emRevisao,
    temas: recorte,
  }
}
