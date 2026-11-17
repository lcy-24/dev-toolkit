// 生成扩展图标（纯 Node，无第三方依赖）
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'icons')
mkdirSync(outDir, { recursive: true })

let crcTable = null
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c
    }
  }
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}

function makePng(size, drawPixel) {
  const raw = Buffer.alloc(size * (size * 4 + 1))
  let offset = 0
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = drawPixel(x, y, size)
      raw[offset++] = r
      raw[offset++] = g
      raw[offset++] = b
      raw[offset++] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function inRoundRect(px, py, x0, y0, x1, y1, r) {
  if (px < x0 || px > x1 || py < y0 || py > y1) return false
  if (px >= x0 + r && px <= x1 - r) return true
  if (py >= y0 + r && py <= y1 - r) return true
  const corners = [
    [x0 + r, y0 + r],
    [x1 - r, y0 + r],
    [x0 + r, y1 - r],
    [x1 - r, y1 - r],
  ]
  for (const [cx, cy] of corners) {
    const dx = px - cx
    const dy = py - cy
    if (dx * dx + dy * dy <= r * r) return true
  }
  return false
}

function inCircle(px, py, cx, cy, r) {
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy <= r * r
}

function drawPixel(x, y, size) {
  const px = x / size
  const py = y / size
  // 圆角背景
  if (!inRoundRect(px, py, 0, 0, 1, 1, 0.22)) return [0, 0, 0, 0]
  // 蓝→紫渐变
  const t = py
  const r = Math.round(79 + (108 - 79) * t)
  const g = Math.round(140 + (76 - 140) * t)
  const b = 255

  // 白色代码窗口
  if (inRoundRect(px, py, 0.24, 0.24, 0.76, 0.76, 0.08)) {
    // 红绿灯
    if (inCircle(px, py, 0.34, 0.34, 0.035)) return [255, 95, 87, 255]
    if (inCircle(px, py, 0.415, 0.34, 0.035)) return [254, 188, 46, 255]
    if (inCircle(px, py, 0.49, 0.34, 0.035)) return [40, 200, 64, 255]
    // 代码行
    const lines = [
      [0.52, 0.3, 0.7],
      [0.6, 0.3, 0.66],
      [0.68, 0.3, 0.52],
    ]
    for (const [ly, lx0, lx1] of lines) {
      if (py >= ly - 0.018 && py <= ly + 0.018 && px >= lx0 && px <= lx1) {
        return [208, 213, 221, 255]
      }
    }
    return [255, 255, 255, 255]
  }
  return [r, g, b, 255]
}

for (const size of [16, 48, 128]) {
  const png = makePng(size, drawPixel)
  writeFileSync(join(outDir, 'icon' + size + '.png'), png)
  console.log('生成 icon' + size + '.png (' + png.length + ' bytes)')
}
