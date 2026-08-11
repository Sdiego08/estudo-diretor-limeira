/** Dados vindos de src/data/*.json — só edite os JSON para acrescentar conteúdo. */

export interface Questao {
  id: string
  materia: string
  tema: string
  enunciado: string
  /** 4 ou 5 itens; a tela rotula A, B, C, D, E. */
  alternativas: string[]
  /** Índice 0-based dentro de `alternativas`. */
  gabarito: number
  comentario: string
  fonte?: string
}

export interface Cartao {
  id: string
  materia: string
  tema: string
  frente: string
  verso: string
  fonte?: string
}

export interface Materia {
  id: string
  rotulo: string
  curto: string
  peso: number
}

export interface Tema {
  id: string
  materia: string
  rotulo: string
}

/** Estado persistido em localStorage sob a chave `estudo:v1`. */

export interface Resposta {
  id: string
  escolha: number
  acertou: boolean
}

export interface DiaAtual {
  data: string
  ids: string[]
  indice: number
  respostas: Resposta[]
}

export interface EstadoCartao {
  caixa: number
  proxima: string
  lapsos: number
  /** Data em que o cartão apareceu pela primeira vez — limita a cota diária de inéditos. */
  introduzidoEm?: string
  /** Epoch ms da última avaliação — usado para mandar o cartão recém-errado ao fim da fila. */
  ultimoToque?: number
  /** Marcado quando o cartão foi antecipado por erro em questão do mesmo tema. */
  porErro?: boolean
}

export interface ContagemTema {
  respondidas: number
  acertos: number
}

export interface RegistroDia {
  questoes: number
  acertos: number
  cartoes: number
}

export interface Estado {
  versao: number
  ordemQuestoes: { ids: string[]; cursor: number; rodada: number }
  hoje: DiaAtual | null
  cartoes: Record<string, EstadoCartao>
  porTema: Record<string, ContagemTema>
  dias: Record<string, RegistroDia>
  sequencia: { atual: number; recorde: number; ultimoDia: string | null }
}

export type Avaliacao = 'errei' | 'dificil' | 'sabia'
