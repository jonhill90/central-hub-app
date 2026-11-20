import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('src/styles/tokens.css', 'utf8')
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
function theme(block: string) {
  const m = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((x) => [x[1], x[2]]))
  return m as Record<string, string>
}
const [light, dark] = [css.split('@media')[0], css.split('@media')[1]].map(theme)

describe('theme contrast (WCAG 2.2 AA, 4.5:1)', () => {
  for (const [name, t] of [['light', light], ['dark', dark]] as const) {
    it(`${name}: text, muted, accent and warn badges are readable`, () => {
      expect(ratio(t.text, t.bg)).toBeGreaterThanOrEqual(4.5)
      expect(ratio(t.text, t.surface)).toBeGreaterThanOrEqual(4.5)
      expect(ratio(t.muted, t.surface)).toBeGreaterThanOrEqual(4.5)
      expect(ratio(t.accent, t['accent-bg'])).toBeGreaterThanOrEqual(4.5)
      expect(ratio(t.accent, t.surface)).toBeGreaterThanOrEqual(4.5)
      expect(ratio(t.warn, t['warn-bg'])).toBeGreaterThanOrEqual(4.5)
    })
  }
})
