/** Renderiza texto do JSON preservando as quebras de parágrafo (\n\n) e de linha (\n). */
export default function Paragrafos({ texto, className }: { texto: string; className?: string }) {
  return (
    <>
      {texto.split('\n\n').map((bloco, i) => (
        <p key={i} className={className}>
          {bloco.split('\n').map((linha, j, todas) => (
            <span key={j}>
              {linha}
              {j < todas.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  )
}
