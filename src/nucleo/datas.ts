/** Datas em ISO local (YYYY-MM-DD). Tudo ancorado ao meio-dia para não escorregar por fuso. */

export const DATA_PROVA = '2026-12-13'

export function hojeISO(): string {
  return paraISO(new Date())
}

export function paraISO(d: Date): string {
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia, 12, 0, 0, 0)
}

export function somaDias(iso: string, dias: number): string {
  const d = paraData(iso)
  d.setDate(d.getDate() + dias)
  return paraISO(d)
}

/** Dias de `de` até `ate` (positivo quando `ate` é posterior). */
export function diffDias(de: string, ate: string): number {
  const ms = paraData(ate).getTime() - paraData(de).getTime()
  return Math.round(ms / 86400000)
}

export function diasAteProva(): number {
  return Math.max(0, diffDias(hojeISO(), DATA_PROVA))
}

export function ehPassadoOuHoje(iso: string): boolean {
  return diffDias(hojeISO(), iso) <= 0
}
