import type { Avaliacao, Cartao, Estado, EstadoCartao } from '../tipos'
import { diffDias, hojeISO, somaDias } from './datas'

/** Intervalos por caixa: caixa 1 revisa em 1 dia, caixa 6 em 75. */
export const INTERVALOS = [1, 3, 7, 16, 35, 75]
export const CAIXA_MAXIMA = INTERVALOS.length
/** A partir daqui o cartão conta como consolidado no Progresso. */
export const CAIXA_CONSOLIDADO = 4
/** Cartões inéditos apresentados por dia. Sem esse teto, o dia 1 traria o baralho inteiro. */
export const NOVOS_POR_DIA = 5

export function intervaloDaCaixa(caixa: number): number {
  return INTERVALOS[Math.min(Math.max(caixa, 1), CAIXA_MAXIMA) - 1]
}

export function avaliar(atual: EstadoCartao | undefined, avaliacao: Avaliacao): EstadoCartao {
  const hoje = hojeISO()
  const base: EstadoCartao = atual ?? { caixa: 0, proxima: hoje, lapsos: 0 }
  const introduzidoEm = base.introduzidoEm ?? hoje
  const ultimoToque = Date.now()

  if (avaliacao === 'errei') {
    return { caixa: 0, proxima: hoje, lapsos: base.lapsos + 1, introduzidoEm, ultimoToque }
  }

  const caixa =
    avaliacao === 'dificil' ? Math.max(base.caixa, 1) : Math.min(base.caixa + 1, CAIXA_MAXIMA)

  return {
    caixa,
    proxima: somaDias(hoje, intervaloDaCaixa(caixa)),
    lapsos: base.lapsos,
    introduzidoEm,
    ultimoToque,
  }
}

/**
 * Fila do dia: primeiro os cartões vencidos, depois os inéditos até o limite diário.
 * A ordem dos inéditos segue a ordem do JSON, então é estável entre recarregamentos.
 */
export function filaDeHoje(estado: Estado, cartoes: Cartao[]): Cartao[] {
  const hoje = hojeISO()
  const devidos: Cartao[] = []
  const novos: Cartao[] = []

  for (const cartao of cartoes) {
    const salvo = estado.cartoes[cartao.id]
    if (!salvo) {
      novos.push(cartao)
    } else if (diffDias(hoje, salvo.proxima) <= 0) {
      devidos.push(cartao)
    }
  }

  devidos.sort((a, b) => {
    const ca = estado.cartoes[a.id]
    const cb = estado.cartoes[b.id]
    // Cartões trazidos por erro na tela Hoje vêm primeiro: são a revisão que o erro pediu.
    const prioridade = (ca?.porErro ? 0 : 1) - (cb?.porErro ? 0 : 1)
    if (prioridade !== 0) return prioridade
    // Entre os demais, o que acabou de ser avaliado vai para o fim — é o caso do "Errei".
    return (ca?.ultimoToque ?? 0) - (cb?.ultimoToque ?? 0)
  })

  // Inéditos entram do mais fácil para o mais difícil; empate mantém a ordem do JSON.
  novos.sort((a, b) => (a.dificuldade ?? 2) - (b.dificuldade ?? 2))

  const introduzidosHoje = Object.values(estado.cartoes).filter(
    (c) => c.introduzidoEm === hoje,
  ).length
  const cotaNovos = Math.max(0, NOVOS_POR_DIA - introduzidosHoje)
  return [...devidos, ...novos.slice(0, cotaNovos)]
}

/** Quando a fila esvazia: em quantos dias volta o próximo cartão. */
export function diasAteProximo(estado: Estado, cartoes: Cartao[]): number | null {
  const hoje = hojeISO()
  let menor: number | null = null
  for (const cartao of cartoes) {
    const salvo = estado.cartoes[cartao.id]
    if (!salvo) continue
    const d = diffDias(hoje, salvo.proxima)
    if (d > 0 && (menor === null || d < menor)) menor = d
  }
  return menor
}

/**
 * Escolhe um cartão do mesmo tema para antecipar quando uma questão é errada.
 * Preferência: inédito → menor caixa → revisão mais distante. Cai para a matéria se o tema esgotar.
 */
export function cartaoParaAntecipar(
  estado: Estado,
  cartoes: Cartao[],
  tema: string,
  materia: string,
): Cartao | null {
  const hoje = hojeISO()
  const disponivel = (c: Cartao) => {
    const salvo = estado.cartoes[c.id]
    return !salvo || diffDias(hoje, salvo.proxima) > 0
  }
  const ranquear = (c: Cartao) => {
    const salvo = estado.cartoes[c.id]
    if (!salvo) return -1
    return salvo.caixa
  }


  const escolher = (candidatos: Cartao[]) => {
    if (candidatos.length === 0) return null
    return candidatos.slice().sort((a, b) => {
      const diff = ranquear(a) - ranquear(b)
      if (diff !== 0) return diff
      const pa = estado.cartoes[a.id]?.proxima ?? ''
      const pb = estado.cartoes[b.id]?.proxima ?? ''
      return pb.localeCompare(pa)
    })[0]
  }

  return (
    escolher(cartoes.filter((c) => c.tema === tema && disponivel(c))) ??
    escolher(cartoes.filter((c) => c.materia === materia && disponivel(c)))
  )
}
