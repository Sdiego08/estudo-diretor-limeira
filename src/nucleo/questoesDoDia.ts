import type { Estado, Questao } from '../tipos'
import { hojeISO } from './datas'
import { ordemEstratificada } from './aleatorio'

export const QUESTOES_POR_DIA = 3
/** Semente fixa: a ordem do banco é sempre a mesma para este app. */
const SEMENTE_BASE = 20261213

export function nivel(item: { dificuldade?: number }): number {
  return item.dificuldade ?? 2
}

/**
 * Ordem do banco: primeiro as fáceis, por último as difíceis.
 * Dentro de cada nível, embaralha com semente e intercala matérias, para que as
 * 3 questões do dia não caiam todas no mesmo assunto.
 */
function gerarOrdem(questoes: Questao[], rodada: number): string[] {
  const ids: string[] = []
  for (const grau of [1, 2, 3]) {
    const doGrau = questoes.filter((q) => nivel(q) === grau)
    if (doGrau.length === 0) continue
    ids.push(
      ...ordemEstratificada(doGrau, (q) => q.materia, SEMENTE_BASE + rodada * 10 + grau).map(
        (q) => q.id,
      ),
    )
  }
  return ids
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
 * Retira as próximas `quantidade` questões do cursor, virando de rodada se o banco acabar.
 * Devolve os ids e a posição atualizada do cursor.
 */
function puxar(
  ordem: Estado['ordemQuestoes'],
  questoes: Questao[],
  quantidade: number,
): { retirados: string[]; ordem: Estado['ordemQuestoes'] } {
  let { ids, cursor, rodada } = ordem

  // Banco esgotado: nova rodada, com outra ordem.
  if (cursor >= ids.length) {
    rodada += 1
    ids = gerarOrdem(questoes, rodada)
    cursor = 0
  }

  const retirados = ids.slice(cursor, cursor + quantidade)

  // Se a rodada acabar no meio, completa com o começo da seguinte.
  if (retirados.length < quantidade) {
    const faltam = quantidade - retirados.length
    const proximaRodada = rodada + 1
    const novos = gerarOrdem(questoes, proximaRodada)
    return {
      retirados: [...retirados, ...novos.slice(0, faltam)],
      ordem: { ids: novos, cursor: faltam, rodada: proximaRodada },
    }
  }

  return { retirados, ordem: { ids, cursor: cursor + retirados.length, rodada } }
}

/**
 * Garante que `estado.hoje` corresponda ao dia corrente.
 * Recarregar a página no mesmo dia devolve exatamente as mesmas questões.
 */
export function garantirDia(estadoEntrada: Estado, questoes: Questao[]): Estado {
  const estado = conciliarOrdem(estadoEntrada, questoes)
  const hoje = hojeISO()
  if (estado.hoje && estado.hoje.data === hoje) return estado

  const { retirados, ordem } = puxar(estado.ordemQuestoes, questoes, QUESTOES_POR_DIA)
  return {
    ...estado,
    ordemQuestoes: ordem,
    hoje: { data: hoje, ids: retirados, indice: 0, respostas: [] },
  }
}

/**
 * Acrescenta mais um bloco de questões ao dia corrente, para quem quiser passar das 3.
 * Continua consumindo o mesmo cursor, então não repete nem quebra o determinismo.
 */
export function estenderDia(estado: Estado, questoes: Questao[]): Estado {
  if (!estado.hoje) return estado
  const { retirados, ordem } = puxar(estado.ordemQuestoes, questoes, QUESTOES_POR_DIA)
  return {
    ...estado,
    ordemQuestoes: ordem,
    hoje: { ...estado.hoje, ids: [...estado.hoje.ids, ...retirados] },
  }
}
