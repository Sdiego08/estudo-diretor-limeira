import { useState } from 'react'
import BarraDeAbas from './componentes/BarraDeAbas'
import type { Aba } from './componentes/BarraDeAbas'
import Cartoes from './telas/Cartoes'
import Hoje from './telas/Hoje'
import Progresso from './telas/Progresso'
import { useEstudo } from './nucleo/estado'

export default function App() {
  // Abre sempre em Hoje: nenhuma escolha antes de começar a responder.
  const [aba, setAba] = useState<Aba>('hoje')
  const { filaCartoes } = useEstudo()

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <main>
        {aba === 'hoje' && <Hoje aoIrParaCartoes={() => setAba('cartoes')} />}
        {aba === 'cartoes' && <Cartoes />}
        {aba === 'progresso' && <Progresso />}
      </main>
      <BarraDeAbas ativa={aba} aoTrocar={setAba} pendentes={filaCartoes.length} />
    </div>
  )
}
