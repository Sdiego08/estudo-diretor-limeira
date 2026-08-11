import { useMemo, useState } from 'react'
import BarraTema from '../componentes/BarraTema'
import Contador from '../componentes/Contador'
import Paragrafos from '../componentes/Paragrafos'
import { CARTOES, MATERIAS, QUESTOES, TEMAS, useEstudo } from '../nucleo/estado'
import { JANELA_DIAS, resumir } from '../nucleo/progresso'
import type { ErroParaRevisar } from '../nucleo/progresso'

const LETRAS = ['A', 'B', 'C', 'D', 'E']

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

function ItemErro({ erro }: { erro: ErroParaRevisar }) {
  const [aberto, setAberto] = useState(false)
  const { questao } = erro

  return (
    <li className="py-3">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="w-full text-left"
      >
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-corpo text-[16px] leading-snug">
            {questao.enunciado.length > 96
              ? `${questao.enunciado.slice(0, 96).trimEnd()}…`
              : questao.enunciado}
          </span>
          <span className="shrink-0 font-titulo text-[12px] text-tinta-suave">
            {aberto ? 'fechar' : erro.vezes > 1 ? `${erro.vezes}×` : 'ver'}
          </span>
        </span>
      </button>

      {aberto && (
        <div className="mt-3 rounded-carta bg-papel-fundo px-4 py-4">
          <p className="rotulo-secao">Resposta correta</p>
          <p className="mt-1 font-corpo text-[16px] leading-snug">
            <span className="font-titulo font-semibold text-quadro">
              {LETRAS[questao.gabarito]}.{' '}
            </span>
            {questao.alternativas[questao.gabarito]}
          </p>
          <div className="mt-3 space-y-3 border-t border-linha pt-3">
            <Paragrafos
              texto={questao.comentario}
              className="font-corpo text-[15px] leading-relaxed text-tinta"
            />
          </div>
        </div>
      )}
    </li>
  )
}

export default function Progresso() {
  const { estado } = useEstudo()
  const resumo = useMemo(
    () => resumir(estado, CARTOES, TEMAS, MATERIAS, QUESTOES),
    [estado],
  )

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
          <h2 className="rotulo-secao">Últimos {JANELA_DIAS} dias</h2>
          {resumo.janela.dias === 0 ? (
            <p className="mt-3 font-corpo text-[17px] leading-relaxed text-tinta-suave">
              Ainda sem atividade registrada nesta janela.
            </p>
          ) : (
            <p className="mt-3 font-corpo text-[17px] leading-relaxed">
              {resumo.janela.dias} {resumo.janela.dias === 1 ? 'dia de estudo' : 'dias de estudo'},{' '}
              {resumo.janela.questoes}{' '}
              {resumo.janela.questoes === 1 ? 'questão respondida' : 'questões respondidas'}
              {resumo.janela.percentual !== null && ` com ${resumo.janela.percentual}% de acerto`} e{' '}
              {resumo.janela.cartoes}{' '}
              {resumo.janela.cartoes === 1 ? 'cartão revisado' : 'cartões revisados'}.
            </p>
          )}
        </section>

        {resumo.materias.length > 0 && (
          <section className="mt-8">
            <h2 className="rotulo-secao">Por matéria</h2>
            <ul className="mt-2 divide-y divide-linha">
              {resumo.materias.map((materia) => (
                <BarraTema key={materia.id} tema={materia} />
              ))}
            </ul>
          </section>
        )}

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

        <section className="mt-8">
          <h2 className="rotulo-secao">
            Suas questões erradas
            {resumo.erros.length > 0 && ` — ${resumo.erros.length}`}
          </h2>
          {resumo.erros.length === 0 ? (
            <p className="mt-3 font-corpo text-[17px] leading-relaxed text-tinta-suave">
              Nada pendente aqui. Uma questão sai desta lista quando você a acerta numa
              rodada seguinte.
            </p>
          ) : (
            <>
              <p className="mt-2 font-corpo text-[15px] leading-relaxed text-tinta-suave">
                Toque para reler o comentário. Cada uma sai da lista ao ser acertada.
              </p>
              <ul className="mt-1 divide-y divide-linha">
                {resumo.erros.map((erro) => (
                  <ItemErro key={erro.questao.id} erro={erro} />
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
