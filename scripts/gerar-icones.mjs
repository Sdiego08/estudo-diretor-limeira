// Gera os PNGs do PWA sem dependências externas.
// Uso: node scripts/gerar-icones.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLICO = join(RAIZ, 'public')

const QUADRO = [0x2f, 0x4f, 0x43]
const PAPEL = [0xfb, 0xf7, 0xef]
const AMBAR = [0xc8, 0x86, 0x0d]

const tabelaCrc = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = tabelaCrc[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function bloco(tipo, dados) {
  const tamanho = Buffer.alloc(4)
  tamanho.writeUInt32BE(dados.length)
  const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(corpo))
  return Buffer.concat([tamanho, corpo, crc])
}

function png(largura, altura, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(largura, 0)
  ihdr.writeUInt32BE(altura, 4)
  ihdr[8] = 8 // profundidade
  ihdr[9] = 2 // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloco('IHDR', ihdr),
    bloco('IDAT', deflateSync(pixels, { level: 9 })),
    bloco('IEND', Buffer.alloc(0)),
  ])
}

/** Caderno: página off-white sobre o verde-quadro, com lombada âmbar. */
function desenhar(tamanho, margemRelativa) {
  const linhas = Buffer.alloc(tamanho * (tamanho * 3 + 1))
  const m = Math.round(tamanho * margemRelativa)
  const pagX0 = m
  const pagX1 = tamanho - m
  const pagY0 = Math.round(m * 0.85)
  const pagY1 = tamanho - Math.round(m * 0.85)
  const lombada = Math.max(2, Math.round(tamanho * 0.055))
  const pauta = Math.max(1, Math.round(tamanho * 0.012))

  let p = 0
  for (let y = 0; y < tamanho; y++) {
    linhas[p++] = 0 // filtro "none"
    for (let x = 0; x < tamanho; x++) {
      let cor = QUADRO
      const naPagina = x >= pagX0 && x < pagX1 && y >= pagY0 && y < pagY1
      if (naPagina) {
        cor = x < pagX0 + lombada ? AMBAR : PAPEL
        // Pautas discretas na página.
        if (x >= pagX0 + lombada * 2) {
          const alturaUtil = pagY1 - pagY0
          const passo = Math.round(alturaUtil / 5)
          const dentro = (y - pagY0) % passo
          if (dentro < pauta && y - pagY0 > passo * 0.6 && y < pagY1 - passo * 0.4) {
            cor = QUADRO
          }
        }
      }
      linhas[p++] = cor[0]
      linhas[p++] = cor[1]
      linhas[p++] = cor[2]
    }
  }
  return png(tamanho, tamanho, linhas)
}

mkdirSync(PUBLICO, { recursive: true })

const saidas = [
  ['icone-192.png', 192, 0.18],
  ['icone-512.png', 512, 0.18],
  // Maskable precisa caber na zona segura de 80%: mais margem.
  ['icone-maskable-512.png', 512, 0.28],
]

for (const [nome, tamanho, margem] of saidas) {
  writeFileSync(join(PUBLICO, nome), desenhar(tamanho, margem))
  console.log(`gerado public/${nome}`)
}
