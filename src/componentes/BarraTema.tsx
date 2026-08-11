import type { RecorteTema } from '../nucleo/progresso'

export default function BarraTema({ tema }: { tema: RecorteTema }) {
  const fraco = tema.percentual < 60
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-titulo text-[14px] leading-tight">{tema.rotulo}</span>
        <span className="shrink-0 font-titulo text-[13px] tabular-nums text-tinta-suave">
          {tema.acertos}/{tema.respondidas}
          <span className={`ml-2 font-semibold ${fraco ? 'text-erro' : 'text-quadro'}`}>
            {tema.percentual}%
          </span>
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-papel-fundo">
        <div
          className={`h-full rounded-full ${fraco ? 'bg-erro' : 'bg-quadro'}`}
          style={{ width: `${Math.max(tema.percentual, 2)}%` }}
        />
      </div>
    </li>
  )
}
