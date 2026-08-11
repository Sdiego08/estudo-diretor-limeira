import { useEffect, useRef } from 'react'
import Alternativa from '../componentes/Alternativa'
import Contador from '../componentes/Contador'
import Paragrafos from '../componentes/Paragrafos'
import { TEMAS, useEstudo } from '../nucleo/estado'
import { QUESTOES_POR_DIA } from '../nucleo/questoesDoDia'

const ROTULO_TEMA = new Map(TEMAS.map((t) => [t.id, t.rotulo]))

export default function Hoje({ aoIrParaCartoes }: { aoIrParaCartoes: () => void }) {
  const { estado, questoesDeHoje, questaoAtual, concluiuHoje, responder, avancar, continuar } =
    useEstudo()
  const topo = useRef<HTMLDivElement>(null)
  const indice = estado.hoje?.indice ?? 0

  useEffect(() => {
    topo.current?.scrollIntoView({ block: 'start' })
  }, [indice])

  if (concluiuHoje) {
    const acertos = estado.hoje?.respostas.filter((r) => r.acertou).length ?? 0
    const total = questoesDeHoje.length
    const errou = total - acertos
    return (
      <div className="flex min-h-dvh flex-col">
        <Contador />
        <div className="flex flex-1 flex-col justify-center px-5 pb-28">
          <p className="rotulo-secao">Sessão concluída</p>
          <p className="mt-3 font-titulo text-[64px] leading-none tabular-nums text-quadro">
            {acertos}
            <span className="text-[28px] text-tinta-suave"> de {total}</span>
          </p>
          <p className="mt-5 max-w-[30ch] font-corpo text-[17px] leading-relaxed text-tinta-suave">
            {errou === 0
              ? 'Três de três. Os cartões de hoje continuam disponíveis se você quiser seguir.'
              : `${errou === 1 ? 'Um tema' : `${errou} temas`} em que você errou ${
                  errou === 1 ? 'foi agendado' : 'foram agendados'
                } para revisão em Cartões.`}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={continuar}
              className="rounded-carta bg-quadro px-6 py-4 text-[15px] text-papel"
            >
              Responder mais {QUESTOES_POR_DIA}
            </button>
            <button
              type="button"
              onClick={aoIrParaCartoes}
              className="rounded-carta border border-linha bg-white/70 px-6 py-4 text-[15px] text-quadro"
            >
              Ir para os cartões
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!questaoAtual) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Contador />
        <p className="px-5 pt-10 font-corpo text-[17px] text-tinta-suave">
          Nenhuma questão disponível. Verifique se <code>src/data/questoes.json</code> tem itens.
        </p>
      </div>
    )
  }

  const resposta = estado.hoje?.respostas.find((r) => r.id === questaoAtual.id)
  const respondida = !!resposta
  const ultima = indice === questoesDeHoje.length - 1

  return (
    <div ref={topo} className="min-h-dvh pb-28">
      <Contador direita={`Questão ${indice + 1} de ${questoesDeHoje.length}`} />

      <div className="px-5">
        <p className="rotulo-secao text-quadro">{ROTULO_TEMA.get(questaoAtual.tema) ?? questaoAtual.tema}</p>

        <div className="mt-3">
          <Paragrafos
            texto={questaoAtual.enunciado}
            className="mb-3 font-corpo text-[20px] leading-[1.45]"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {questaoAtual.alternativas.map((texto, i) => (
            <Alternativa
              key={i}
              indice={i}
              texto={texto}
              respondida={respondida}
              ehGabarito={i === questaoAtual.gabarito}
              ehEscolhida={resposta?.escolha === i}
              aoEscolher={responder}
            />
          ))}
        </div>

        {respondida && (
          <div className="mt-6">
            <div className="superficie px-4 py-4">
              <p className="rotulo-secao">{resposta.acertou ? 'Você acertou' : 'Comentário'}</p>
              <div className="mt-2 space-y-3">
                <Paragrafos
                  texto={questaoAtual.comentario}
                  className="font-corpo text-[16px] leading-relaxed text-tinta"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={avancar}
              className="mt-4 w-full rounded-carta bg-quadro px-6 py-4 text-[15px] text-papel"
            >
              {ultima ? 'Ver resultado' : 'Próxima questão'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
