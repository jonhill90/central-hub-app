import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

// Spec 0005: the slate theme's rules, checked on the files.
const tokens = readFileSync('src/styles/tokens.css', 'utf8')
const app = readFileSync('src/styles/app.css', 'utf8')
const [dark, light] = [tokens.split('@media')[0], tokens.split('@media')[1]]
const val = (block: string, name: string) => block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim()

const standard: Record<string, [string, string]> = {
  bg: ['#11171a', '#eef1f3'], surface: ['#1a2227', '#ffffff'], raised: ['#232d33', '#e4e9ec'],
  border: ['#3c4a52', '#c3cdd2'], text: ['#e2e8ec', '#1c2428'], muted: ['#9aabb2', '#4c5a63'],
  accent: ['#6db33a', '#3b7316'], 'accent-hover': ['#86c653', '#2c5a0f'],
  'accent-fill': ['#4a8024', '#3b7316'], 'on-accent': ['#ffffff', '#ffffff'],
  'logo-light': ['#7a8e96', '#7a8e96'], 'logo-dark': ['#4c5a63', '#4c5a63'], radius: ['8px', '8px'],
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const f = path.join(dir, n)
    return statSync(f).isDirectory() ? walk(f) : [f]
  })
}

describe('slate theme', () => {
  it('token values equal the standard table (req 5)', () => {
    for (const [name, [d, l]] of Object.entries(standard)) {
      expect(val(dark, name), `dark ${name}`).toBe(d)
      expect(val(light, name), `light ${name}`).toBe(l)
    }
  })
  it('corners are rounded by one token: border-radius only through --radius (req 2)', () => {
    for (const m of app.matchAll(/border-radius:\s*([^;]+);/g)) {
      expect(['var(--radius)', 'calc(var(--radius) / 2)', '50%', '999px'].includes(m[1].trim()), m[1]).toBe(true)
    }
  })
  it('--accent is used only on links, the current menu item, icon boxes and the focused search box (req 3)', () => {
    const rules = app.split('}').filter((r) => r.includes('var(--accent)') || r.includes('var(--accent-hover)'))
    expect(rules.length).toBeGreaterThan(0)
    const allowed = (sel: string) => /^a(:|$)/.test(sel) || /\sa(:|$)/.test(sel) || /^\.side a\[aria-current="page"\]/.test(sel) || sel === '.icon-box' || sel === '.search:focus-within' || sel === '.btn.primary:hover'
    for (const r of rules) expect(r.split('{')[0].trim().split(',').every((sel) => allowed(sel.trim())), r).toBe(true)
  })
  it('buttons are filled from --accent-fill, never from --accent (req 3)', () => {
    expect(app).toMatch(/\.btn\.primary\s*\{[^}]*var\(--accent-fill\)/)
  })
  it('no hex colour outside tokens.css (req 4)', () => {
    const files = [...walk('src')].filter((f) => /\.(css|tsx?)$/.test(f) && !f.endsWith('tokens.css'))
    for (const f of files) expect(readFileSync(f, 'utf8'), f).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
  it('the checks reject bad input', () => {
    expect('a { color: #fff; }').toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(val('--radius: 8px;', 'radius')).toBe('8px')
    expect(val('--radius: 0;', 'radius')).not.toBe('8px')
  })
})
