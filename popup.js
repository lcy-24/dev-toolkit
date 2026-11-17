'use strict'

/* ===================== Tab 切换 ===================== */
const tabs = document.querySelectorAll('.tab')
const panels = document.querySelectorAll('.panel')

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'))
    panels.forEach((p) => p.classList.remove('active'))
    tab.classList.add('active')
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active')
  })
})

/* ===================== 输出辅助 ===================== */
function setOutput(el, text, isError = false) {
  el.textContent = text
  el.classList.toggle('error', isError)
}

/* ===================== JSON ===================== */
const jsonInput = document.getElementById('json-input')
const jsonOutput = document.getElementById('json-output')

function getJson() {
  try {
    return JSON.parse(jsonInput.value)
  } catch (e) {
    setOutput(jsonOutput, 'JSON 解析失败：' + e.message, true)
    return undefined
  }
}

document.getElementById('json-format').addEventListener('click', () => {
  const obj = getJson()
  if (obj !== undefined) setOutput(jsonOutput, JSON.stringify(obj, null, 2))
})

document.getElementById('json-minify').addEventListener('click', () => {
  const obj = getJson()
  if (obj !== undefined) setOutput(jsonOutput, JSON.stringify(obj))
})

document.getElementById('json-validate').addEventListener('click', () => {
  const obj = getJson()
  if (obj !== undefined) {
    setOutput(jsonOutput, '✓ JSON 校验通过，共 ' + countNodes(obj) + ' 个节点')
  }
})

document.getElementById('json-clear').addEventListener('click', () => {
  jsonInput.value = ''
  jsonOutput.textContent = ''
})

function countNodes(obj) {
  let n = 0
  if (obj && typeof obj === 'object') {
    for (const k in obj) {
      n++
      if (obj[k] && typeof obj[k] === 'object') n += countNodes(obj[k])
    }
  }
  return n
}

/* ===================== 时间戳 ===================== */
const tsInput = document.getElementById('ts-input')
const dateInput = document.getElementById('date-input')
const tsOutput = document.getElementById('ts-output')

function pad(n) {
  return String(n).padStart(2, '0')
}

document.getElementById('ts-to-date').addEventListener('click', () => {
  let n = Number(tsInput.value)
  if (!tsInput.value || !Number.isFinite(n)) {
    setOutput(tsOutput, '请输入有效的时间戳', true)
    return
  }
  if (Math.abs(n) < 1e11) n *= 1000 // 秒 → 毫秒
  const d = new Date(n)
  const local =
    d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
  const utc = d.toISOString().slice(0, 19).replace('T', ' ') + ' (UTC)'
  const diff = Date.now() - n
  const rel =
    diff >= 0
      ? '距今 ' + humanize(diff) + ' 前'
      : '距今 ' + humanize(-diff) + ' 后'
  setOutput(tsOutput, '本地时间：' + local + '\nUTC 时间：' + utc + '\n毫秒值：' + n + '\n' + rel)
})

document.getElementById('ts-now').addEventListener('click', () => {
  const now = Math.floor(Date.now() / 1000)
  tsInput.value = now
  dateInput.value = new Date().toLocaleString('zh-CN', { hour12: false })
})

document.getElementById('date-to-ts').addEventListener('click', () => {
  const d = new Date(dateInput.value.replace(/-/g, '/'))
  if (isNaN(d.getTime())) {
    setOutput(tsOutput, '日期格式无效，请用 2024-01-01 12:00:00', true)
    return
  }
  setOutput(tsOutput, '秒：' + Math.floor(d.getTime() / 1000) + '\n毫秒：' + d.getTime())
})

function humanize(ms) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return s + ' 秒'
  const m = Math.floor(s / 60)
  if (m < 60) return m + ' 分钟'
  const h = Math.floor(m / 60)
  if (h < 24) return h + ' 小时'
  const day = Math.floor(h / 24)
  return day + ' 天'
}

/* ===================== 编解码 ===================== */
const encInput = document.getElementById('enc-input')
const encOutput = document.getElementById('enc-output')

function b64Encode(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function b64Decode(b64) {
  const binary = atob(b64)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

document.getElementById('enc-base64e').addEventListener('click', () => {
  encOutput.value = b64Encode(encInput.value)
})

document.getElementById('enc-base64d').addEventListener('click', () => {
  try {
    encOutput.value = b64Decode(encInput.value.trim())
  } catch (e) {
    encOutput.value = 'Base64 解码失败：' + e.message
  }
})

document.getElementById('enc-urle').addEventListener('click', () => {
  encOutput.value = encodeURIComponent(encInput.value)
})

document.getElementById('enc-urld').addEventListener('click', () => {
  try {
    encOutput.value = decodeURIComponent(encInput.value)
  } catch (e) {
    encOutput.value = 'URL 解码失败：' + e.message
  }
})

/* ===================== 颜色 ===================== */
const colorInput = document.getElementById('color-input')
const colorPreview = document.getElementById('color-preview')
const colorHex = document.getElementById('color-hex')
const colorRgb = document.getElementById('color-rgb')
const colorHsl = document.getElementById('color-hsl')

function updateColor(hex) {
  hex = normalizeHex(hex)
  if (!hex) return
  colorHex.value = hex
  colorPreview.style.background = hex
  colorInput.value = hex
  const { r, g, b } = hexToRgb(hex)
  const { h, s, l } = rgbToHsl(r, g, b)
  colorRgb.textContent = 'RGB: ' + r + ', ' + g + ', ' + b
  colorHsl.textContent = 'HSL: ' + h + '°, ' + s + '%, ' + l + '%'
}

function normalizeHex(hex) {
  hex = hex.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex.split('').map((c) => c + c).join('')
  }
  return /^[0-9a-fA-F]{6}$/.test(hex) ? '#' + hex.toUpperCase() : null
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

colorInput.addEventListener('input', () => updateColor(colorInput.value))
colorHex.addEventListener('change', () => {
  const hex = normalizeHex(colorHex.value)
  if (hex) updateColor(hex)
  else colorHex.value = colorPreview.style.background
})

document.getElementById('color-apply').addEventListener('click', () => {
  const hex = normalizeHex(colorHex.value)
  if (hex) updateColor(hex)
})

document.getElementById('color-pick').addEventListener('click', async () => {
  if (window.EyeDropper) {
    try {
      const eyeDropper = new EyeDropper()
      const result = await eyeDropper.open()
      updateColor(result.sRGBHex)
    } catch (e) {
      // 用户取消
    }
  } else {
    updateColor(colorHex.value)
  }
})

// 初始化
updateColor('#3B82F6')
