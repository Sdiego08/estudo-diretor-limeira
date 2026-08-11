import { diasAteProva } from '../nucleo/datas'

export default function Contador({ direita }: { direita?: string }) {
  const dias = diasAteProva()

  return (
    <header className="flex items-baseline justify-between px-5 pt-6 pb-3">
      <p className="rotulo-secao">
        {dias === 0 ? 'Prova hoje' : `${dias} ${dias === 1 ? 'dia' : 'dias'} até a prova`}
      </p>
      {direita && <p className="rotulo-secao">{direita}</p>}
    </header>
  )
}
