import { useMemo } from 'react'
import BarraTema from '../componentes/BarraTema'
import Contador from '../componentes/Contador'
import { CARTOES, TEMAS, useEstudo } from '../nucleo/estado'
import { resumir } from '../nucleo/progresso'

function Numero({ valor, rotulo, sufixo }: { valor: string; rotulo: string; sufixo?: string }) {
  return (
    <div className="superficie px-4 py-4">
      <p className="font-titulo text-[32px] leading-none tabular-nums text-quadro">
        {valor}
        {sufixo && <span className="text-[16px] text-tinta-suave">{sufixo}</span>}
      </p>
      <p className="rotulo-secao mt-2 normal-case tracking-normal">{rotulo}</p>
    </div>
  )
}

export default function Progresso() {
  const { estado } = useEstudo()
  const resumo = useMemo(() => resumir(estado, CARTOES, TEMAS), [estado])

  return (
    <div className="min-h-dvh pb-28">
      <Contador />

      <div className="px-5">
        <div className="grid grid-cols-2 gap-3">
          <Numero
            valor={String(resumo.sequenciaAtual)}
            sufixo={resumo.sequenciaAtual === 1 ? ' dia' : ' dias'}
            rotulo={
              resumo.sequenciaRecorde > resumo.sequenciaAtual
                ? `Sequência atual — recorde de ${resumo.sequenciaRecorde}`
                : 'Sequência de dias seguidos'
            }
          />
          <Numero
            valor={resumo.percentual === null ? '—' : String(resumo.percentual)}
            sufixo={resumo.percentual === null ? undefined : '%'}
            rotulo={
              resumo.respondidas > 0
                ? `Acerto acumulado em ${resumo.respondidas} questões`
                : 'Acerto acumulado'
            }
          />
        </div>

        <div className="mt-3 superficie px-4 py-4">
          <p className="font-titulo text-[32px] leading-none tabular-nums text-quadro">
            {resumo.consolidados}
            <span className="text-[16px] text-tinta-suave"> de {resumo.totalCartoes}</span>
          </p>
          <p className="rotulo-secao mt-2 normal-case tracking-normal">
            Cartões consolidados
            {resumo.emRevisao > 0 && ` — ${resumo.emRevisao} ainda em revisão`}
          </p>
        </div>

        <section className="mt-8">
          <h2 className="rotulo-secao">Por tema — os mais fracos primeiro</h2>
          {resumo.temas.length === 0 ? (
            <p className="mt-3 font-corpo text-[17px] leading-relaxed text-tinta-suave">
              O recorte por tema aparece depois das primeiras questões respondidas.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-linha">
              {resumo.temas.map((tema) => (
                <BarraTema key={tema.id} tema={tema} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
