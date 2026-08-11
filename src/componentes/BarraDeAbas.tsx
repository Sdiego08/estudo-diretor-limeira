export type Aba = 'hoje' | 'cartoes' | 'progresso'

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'hoje', rotulo: 'Hoje' },
  { id: 'cartoes', rotulo: 'Cartões' },
  { id: 'progresso', rotulo: 'Progresso' },
]

interface Props {
  ativa: Aba
  aoTrocar: (aba: Aba) => void
  pendentes: number
}

export default function BarraDeAbas({ ativa, aoTrocar, pendentes }: Props) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 inset-x-0 z-20 border-t border-linha bg-papel/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md">
        {ABAS.map((aba) => {
          const selecionada = aba.id === ativa
          return (
            <li key={aba.id} className="flex-1">
              <button
                type="button"
                onClick={() => aoTrocar(aba.id)}
                aria-current={selecionada ? 'page' : undefined}
                className={`relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[13px] tracking-wide transition-colors ${
                  selecionada ? 'text-quadro' : 'text-tinta-suave'
                }`}
              >
                <span
                  aria-hidden
                  className={`h-[3px] w-8 rounded-full transition-colors ${
                    selecionada ? 'bg-quadro' : 'bg-transparent'
                  }`}
                />
                <span className="flex items-center gap-1.5">
                  {aba.rotulo}
                  {aba.id === 'cartoes' && pendentes > 0 && (
                    <span
                      className="rounded-full bg-ambar-claro px-1.5 py-0.5 text-[11px] font-semibold text-tinta"
                      aria-label={`${pendentes} cartões pendentes`}
                    >
                      {pendentes}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
