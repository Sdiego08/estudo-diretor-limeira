const LETRAS = ['A', 'B', 'C', 'D', 'E']

interface Props {
  indice: number
  texto: string
  respondida: boolean
  ehGabarito: boolean
  ehEscolhida: boolean
  aoEscolher: (indice: number) => void
}

export default function Alternativa({
  indice,
  texto,
  respondida,
  ehGabarito,
  ehEscolhida,
  aoEscolher,
}: Props) {
  let moldura = 'border-linha bg-white/70'
  let selo: string | null = null

  if (respondida) {
    if (ehGabarito) {
      moldura = 'border-quadro bg-quadro/[0.07]'
      selo = 'Correta'
    } else if (ehEscolhida) {
      moldura = 'border-erro bg-erro-claro'
      selo = 'Sua resposta'
    } else {
      moldura = 'border-linha bg-transparent opacity-55'
    }
  }

  return (
    <button
      type="button"
      disabled={respondida}
      onClick={() => aoEscolher(indice)}
      aria-pressed={ehEscolhida}
      className={`w-full rounded-carta border px-4 py-4 text-left transition-colors disabled:cursor-default ${moldura}`}
      style={{ minHeight: '4rem' }}
    >
      <span className="flex gap-3">
        <span
          aria-hidden
          className={`mt-[1px] shrink-0 font-titulo text-sm font-semibold ${
            respondida && ehGabarito ? 'text-quadro' : 'text-tinta-suave'
          }`}
        >
          {LETRAS[indice]}
        </span>
        <span className="flex-1 font-corpo text-[17px] leading-snug">{texto}</span>
      </span>
      {selo && (
        <span
          className={`mt-2 block pl-7 font-titulo text-[11px] uppercase tracking-[0.14em] ${
            ehGabarito ? 'text-quadro' : 'text-erro'
          }`}
        >
          {selo}
        </span>
      )}
    </button>
  )
}
