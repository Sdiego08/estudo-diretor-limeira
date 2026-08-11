import type { Estado, Questao } from '../tipos'
import { hojeISO } from './datas'
import { ordemEstratificada } from './aleatorio'

export const QUESTOES_POR_DIA = 3
/** Semente fixa: a ordem do banco é sempre a mesma para este app. */
const SEMENTE_BASE = 20261213

function gerarOrdem(questoes: Questao[], rodada: number): string[] {
  return ordemEstratificada(questoes, (q) => q.materia, SEMENTE_BASE + rodada).map((q) => q.id)
}

/**
 * Mantém a ordem coerente com o banco atual: remove ids que sumiram do JSON e
 * acrescenta ao final os que foram incluídos depois, sem embaralhar o que já passou.
 */
function conciliarOrdem(estado: Estado, questoes: Questao[]): Estado {
  const existentes = new Set(questoes.map((q) => q.id))
  const naOrdem = new Set(estado.ordemQuestoes.ids)

  if (estado.ordemQuestoes.ids.length === 0) {
    return {
      ...estado,
      ordemQuestoes: { ids: gerarOrdem(questoes, estado.ordemQuestoes.rodada), cursor: 0, rodada: estado.ordemQuestoes.rodada },
    }
  }

  const removidos = estado.ordemQuestoes.ids.filter((id) => !existentes.has(id))
  const novos = questoes.filter((q) => !naOrdem.has(q.id))
  if (removidos.length === 0 && novos.length === 0) return estado

  // Ajusta o cursor pelo número de removidos que estavam antes dele.
  const antesDoCursor = estado.ordemQuestoes.ids
    .slice(0, estado.ordemQuestoes.cursor)
    .filter((id) => !existentes.has(id)).length

  const ids = [
    ...estado.ordemQuestoes.ids.filter((id) => existentes.has(id)),
    ...gerarOrdem(novos, estado.ordemQuestoes.rodada + 7),
  ]

  return {
    ...estado,
    ordemQuestoes: {
      ids,
      cursor: Math.max(0, estado.ordemQuestoes.cursor - antesDoCursor),
      rodada: estado.ordemQuestoes.rodada,
    },
  }
}

/**
 * Garante que `estado.hoje` corresponda ao dia corrente.
 * Recarregar a página no mesmo dia devolve exatamente as mesmas questões.
 */
export function garantirDia(estadoEntrada: Estado, questoes: Questao[]): Estado {
  const estado = conciliarOrdem(estadoEntrada, questoes)
  const hoje = hojeISO()
  if (estado.hoje && estado.hoje.data === hoje) return estado

  let { ids, cursor, rodada } = estado.ordemQuestoes

  // Banco esgotado: nova rodada, com outra ordem, sem repetir dentro da rodada anterior.
  if (cursor >= ids.length) {
    rodada += 1
    ids = gerarOrdem(questoes, rodada)
    cursor = 0
  }

  const doDia = ids.slice(cursor, cursor + QUESTOES_POR_DIA)
  // Se a rodada acabar no meio, completa com o começo da rodada seguinte.
  if (doDia.length < QUESTOES_POR_DIA) {
    const proximaRodada = rodada + 1
    const novos = gerarOrdem(questoes, proximaRodada)
    return {
      ...estado,
      ordemQuestoes: { ids: novos, cursor: QUESTOES_POR_DIA - doDia.length, rodada: proximaRodada },
      hoje: {
        data: hoje,
        ids: [...doDia, ...novos.slice(0, QUESTOES_POR_DIA - doDia.length)],
        indice: 0,
        respostas: [],
      },
    }
  }

  return {
    ...estado,
    ordemQuestoes: { ids, cursor: cursor + doDia.length, rodada },
    hoje: { data: hoje, ids: doDia, indice: 0, respostas: [] },
  }
}
