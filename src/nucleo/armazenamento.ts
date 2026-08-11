import type { Estado } from '../tipos'

const CHAVE = 'estudo:v1'
export const VERSAO_ESTADO = 2

export function estadoInicial(): Estado {
  return {
    versao: VERSAO_ESTADO,
    ordemQuestoes: { ids: [], cursor: 0, rodada: 1 },
    hoje: null,
    cartoes: {},
    porTema: {},
    erros: {},
    dias: {},
    sequencia: { atual: 0, recorde: 0, ultimoDia: null },
  }
}

export function carregar(): Estado {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return estadoInicial()
    const dado = JSON.parse(bruto) as Partial<Estado>
    if (dado.versao !== VERSAO_ESTADO) return migrar(dado)
    return { ...estadoInicial(), ...dado } as Estado
  } catch {
    // Estado corrompido não deve travar o app: começa limpo.
    return estadoInicial()
  }
}

export function salvar(estado: Estado): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    // Sem espaço ou modo privativo: seguir sem persistir é melhor que quebrar a sessão.
  }
}

/** Ponto único para converter estados de versões anteriores quando o formato mudar. */
function migrar(dado: Partial<Estado>): Estado {
  return { ...estadoInicial(), ...dado, versao: VERSAO_ESTADO } as Estado
}
