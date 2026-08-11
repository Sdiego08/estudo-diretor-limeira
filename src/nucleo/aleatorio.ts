/** PRNG com semente: a mesma semente sempre produz a mesma ordem. */
export function mulberry32(semente: number): () => number {
  let a = semente >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function embaralhar<T>(itens: T[], rng: () => number): T[] {
  const copia = itens.slice()
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/**
 * Embaralha dentro de cada grupo e depois intercala os grupos em rodízio.
 * Assim as 3 questões de um dia raramente caem todas na mesma matéria.
 */
export function ordemEstratificada<T>(
  itens: T[],
  chaveGrupo: (item: T) => string,
  semente: number,
): T[] {
  const rng = mulberry32(semente)
  const grupos = new Map<string, T[]>()
  for (const item of itens) {
    const chave = chaveGrupo(item)
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave)!.push(item)
  }

  const filas = embaralhar([...grupos.values()], rng).map((g) => embaralhar(g, rng))
  const resultado: T[] = []
  let restam = itens.length
  let i = 0
  while (restam > 0) {
    const fila = filas[i % filas.length]
    if (fila.length > 0) {
      resultado.push(fila.shift()!)
      restam--
    }
    i++
  }
  return resultado
}
