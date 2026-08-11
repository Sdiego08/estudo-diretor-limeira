import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import questoesJson from '../data/questoes.json'
import cartoesJson from '../data/cartoes.json'
import temasJson from '../data/temas.json'

import type { Avaliacao, Cartao, Estado, Materia, Questao, Tema } from '../tipos'
import { carregar, salvar } from './armazenamento'
import { hojeISO, somaDias } from './datas'
import { estenderDia, garantirDia, QUESTOES_POR_DIA } from './questoesDoDia'
import { avaliar, cartaoParaAntecipar, filaDeHoje } from './repeticao'

export const QUESTOES = questoesJson.questoes as Questao[]
export const CARTOES = cartoesJson.cartoes as Cartao[]
export const TEMAS = temasJson.temas as Tema[]
export const MATERIAS = temasJson.materias as Materia[]

const porId = new Map(QUESTOES.map((q) => [q.id, q]))

interface Contexto {
  estado: Estado
  questoesDeHoje: Questao[]
  questaoAtual: Questao | null
  concluiuHoje: boolean
  filaCartoes: Cartao[]
  responder: (escolha: number) => void
  avancar: () => void
  continuar: () => void
  avaliarCartao: (cartao: Cartao, avaliacao: Avaliacao) => void
  reiniciarDia: () => void
}

const ContextoEstudo = createContext<Contexto | null>(null)

/** Um dia entra na sequência quando as questões do dia terminam ou algum cartão é revisado. */
function registrarSequencia(estado: Estado): Estado {
  const hoje = hojeISO()
  const registro = estado.dias[hoje]
  if (!registro) return estado
  const qualifica = registro.questoes >= QUESTOES_POR_DIA || registro.cartoes > 0
  if (!qualifica || estado.sequencia.ultimoDia === hoje) return estado

  const ontem = somaDias(hoje, -1)
  const atual = estado.sequencia.ultimoDia === ontem ? estado.sequencia.atual + 1 : 1
  return {
    ...estado,
    sequencia: {
      atual,
      recorde: Math.max(atual, estado.sequencia.recorde),
      ultimoDia: hoje,
    },
  }
}

function comRegistroDoDia(
  estado: Estado,
  delta: { questoes?: number; acertos?: number; cartoes?: number },
): Estado {
  const hoje = hojeISO()
  const atual = estado.dias[hoje] ?? { questoes: 0, acertos: 0, cartoes: 0 }
  return {
    ...estado,
    dias: {
      ...estado.dias,
      [hoje]: {
        questoes: atual.questoes + (delta.questoes ?? 0),
        acertos: atual.acertos + (delta.acertos ?? 0),
        cartoes: atual.cartoes + (delta.cartoes ?? 0),
      },
    },
  }
}

export function ProvedorEstudo({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(() => garantirDia(carregar(), QUESTOES))

  useEffect(() => {
    salvar(estado)
  }, [estado])

  // A virada de dia com o app aberto precisa trocar as questões sem exigir recarga.
  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setEstado((atual) => (atual.hoje?.data === hojeISO() ? atual : garantirDia(atual, QUESTOES)))
    }, 60_000)
    return () => window.clearInterval(intervalo)
  }, [])

  const questoesDeHoje = useMemo(
    () => (estado.hoje?.ids ?? []).map((id) => porId.get(id)).filter((q): q is Questao => !!q),
    [estado.hoje],
  )

  const indice = estado.hoje?.indice ?? 0
  const questaoAtual = questoesDeHoje[indice] ?? null
  const concluiuHoje = indice >= questoesDeHoje.length && questoesDeHoje.length > 0

  const filaCartoes = useMemo(() => filaDeHoje(estado, CARTOES), [estado])

  const responder = useCallback((escolha: number) => {
    setEstado((atual) => {
      if (!atual.hoje) return atual
      const questao = porId.get(atual.hoje.ids[atual.hoje.indice])
      if (!questao) return atual
      // Ignora toques repetidos: a questão corrente já foi respondida.
      if (atual.hoje.respostas.some((r) => r.id === questao.id)) return atual

      const acertou = escolha === questao.gabarito

      // Lista de revisão: entra ao errar, sai quando a mesma questão é acertada depois.
      const erros = { ...atual.erros }
      if (acertou) {
        delete erros[questao.id]
      } else {
        erros[questao.id] = {
          vezes: (erros[questao.id]?.vezes ?? 0) + 1,
          ultimoErro: hojeISO(),
        }
      }

      let proximo: Estado = {
        ...atual,
        hoje: {
          ...atual.hoje,
          respostas: [...atual.hoje.respostas, { id: questao.id, escolha, acertou }],
        },
        porTema: {
          ...atual.porTema,
          [questao.tema]: {
            respondidas: (atual.porTema[questao.tema]?.respondidas ?? 0) + 1,
            acertos: (atual.porTema[questao.tema]?.acertos ?? 0) + (acertou ? 1 : 0),
          },
        },
        erros,
      }

      proximo = comRegistroDoDia(proximo, { questoes: 1, acertos: acertou ? 1 : 0 })

      // O erro vira revisão: antecipa um cartão do mesmo tema para hoje.
      if (!acertou) {
        const alvo = cartaoParaAntecipar(proximo, CARTOES, questao.tema, questao.materia)
        if (alvo) {
          const salvo = proximo.cartoes[alvo.id]
          proximo = {
            ...proximo,
            cartoes: {
              ...proximo.cartoes,
              [alvo.id]: {
                caixa: salvo?.caixa ?? 0,
                proxima: hojeISO(),
                lapsos: salvo?.lapsos ?? 0,
                introduzidoEm: salvo?.introduzidoEm,
                ultimoToque: salvo?.ultimoToque,
                porErro: true,
              },
            },
          }
        }
      }

      return registrarSequencia(proximo)
    })
  }, [])

  const avancar = useCallback(() => {
    setEstado((atual) => {
      if (!atual.hoje) return atual
      const proximo = { ...atual, hoje: { ...atual.hoje, indice: atual.hoje.indice + 1 } }
      return registrarSequencia(proximo)
    })
  }, [])

  const continuar = useCallback(() => {
    setEstado((atual) => estenderDia(atual, QUESTOES))
  }, [])

  const avaliarCartao = useCallback((cartao: Cartao, avaliacao: Avaliacao) => {
    setEstado((atual) => {
      const proximoCartao = avaliar(atual.cartoes[cartao.id], avaliacao)
      let proximo: Estado = {
        ...atual,
        cartoes: { ...atual.cartoes, [cartao.id]: proximoCartao },
      }
      proximo = comRegistroDoDia(proximo, { cartoes: 1 })
      return registrarSequencia(proximo)
    })
  }, [])

  const reiniciarDia = useCallback(() => {
    setEstado((atual) =>
      atual.hoje ? { ...atual, hoje: { ...atual.hoje, indice: 0, respostas: [] } } : atual,
    )
  }, [])

  const valor: Contexto = {
    estado,
    questoesDeHoje,
    questaoAtual,
    concluiuHoje,
    filaCartoes,
    responder,
    avancar,
    continuar,
    avaliarCartao,
    reiniciarDia,
  }

  return <ContextoEstudo.Provider value={valor}>{children}</ContextoEstudo.Provider>
}

export function useEstudo(): Contexto {
  const contexto = useContext(ContextoEstudo)
  if (!contexto) throw new Error('useEstudo precisa estar dentro de ProvedorEstudo')
  return contexto
}
