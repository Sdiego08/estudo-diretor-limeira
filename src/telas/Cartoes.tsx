import { useEffect, useState } from 'react'
import Contador from '../componentes/Contador'
import Paragrafos from '../componentes/Paragrafos'
import { CARTOES, TEMAS, useEstudo } from '../nucleo/estado'
import { diasAteProximo } from '../nucleo/repeticao'
import type { Avaliacao } from '../tipos'

const ROTULO_TEMA = new Map(TEMAS.map((t) => [t.id, t.rotulo]))

const OPCOES: { id: Avaliacao; rotulo: string; classe: string }[] = [
  { id: 'errei', rotulo: 'Errei', classe: 'border-erro text-erro' },
  { id: 'dificil', rotulo: 'Difícil', classe: 'border-ambar text-ambar' },
  { id: 'sabia', rotulo: 'Sabia', classe: 'border-quadro text-quadro' },
]

export default function Cartoes() {
  const { estado, filaCartoes, avaliarCartao } = useEstudo()
  const [revelado, setRevelado] = useState(false)
  const cartao = filaCartoes[0] ?? null

  // Cada cartão começa sempre pela frente.
  useEffect(() => {
    setRevelado(false)
  }, [cartao?.id])

  function registrar(avaliacao: Avaliacao) {
    if (!cartao) return
    // Fecha a resposta antes de avaliar: com "Errei" o mesmo cartão pode reaparecer.
    setRevelado(false)
    avaliarCartao(cartao, avaliacao)
  }

  if (!cartao) {
    const dias = diasAteProximo(estado, CARTOES)
    return (
      <div className="flex min-h-dvh flex-col">
        <Contador />
        <div className="flex flex-1 flex-col justify-center px-5 pb-28">
          <p className="rotulo-secao">Fila vazia</p>
          <p className="mt-3 max-w-[26ch] font-titulo text-[28px] leading-tight text-quadro">
            Nenhum cartão para revisar hoje.
          </p>
          <p className="mt-4 max-w-[32ch] font-corpo text-[17px] leading-relaxed text-tinta-suave">
            {dias === null
              ? 'Responda as questões de hoje para que os primeiros cartões entrem na fila.'
              : `Os próximos voltam em ${dias} ${dias === 1 ? 'dia' : 'dias'}.`}
          </p>
        </div>
      </div>
    )
  }

  const restantes = filaCartoes.length

  return (
    <div className="min-h-dvh pb-28">
      <Contador direita={`${restantes} na fila`} />

      <div className="px-5">
        <p className="rotulo-secao text-quadro">{ROTULO_TEMA.get(cartao.tema) ?? cartao.tema}</p>

        <div className="superficie textura-caderno mt-3 px-5 py-6">
          <Paragrafos
            texto={cartao.frente}
            className="mb-3 font-corpo text-[20px] leading-[1.45]"
          />

          {revelado && (
            <div className="mt-5 border-t border-linha pt-5">
              <Paragrafos
                texto={cartao.verso}
                className="mb-3 font-corpo text-[17px] leading-relaxed"
              />
            </div>
          )}
        </div>

        {!revelado ? (
          <button
            type="button"
            onClick={() => setRevelado(true)}
            className="mt-5 w-full rounded-carta bg-quadro px-6 py-5 text-[15px] text-papel"
          >
            Mostrar resposta
          </button>
        ) : (
          <div className="mt-5">
            <p className="rotulo-secao mb-3">Como foi?</p>
            <div className="grid grid-cols-3 gap-3">
              {OPCOES.map((opcao) => (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => registrar(opcao.id)}
                  className={`rounded-carta border bg-white/70 px-2 py-5 text-[15px] ${opcao.classe}`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
