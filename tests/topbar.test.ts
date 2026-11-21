import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

// Spec 0009: the top bar's search box, bell, theme toggle and avatar, and the theme choice that survives a reload.
const tokens = readFileSync('src/styles/tokens.css', 'utf8')
const shell = readFileSync('src/components/Shell.tsx', 'utf8')
const tools = readFileSync('src/components/TopBarTools.tsx', 'utf8')
const decls = (re: RegExp) => (tokens.match(re)?.[1] ?? '').replace(/\s+/g, ' ').trim()

describe('top bar', () => {
  it('the chosen light theme has the same values as the system light theme (req 1)', () => {
    const media = decls(/:root:not\(\[data-theme="dark"\]\) \{([^}]*)\}/)
    const chosen = decls(/:root\[data-theme="light"\] \{([^}]*)\}/)
    expect(media.length).toBeGreaterThan(50)
    expect(chosen).toBe(media)
  })
  it('the chosen dark theme is the default dark block (req 1)', () => {
    expect(tokens).toMatch(/:root, :root\[data-theme="dark"\] \{/)
  })
  it('the top bar has a real search input, the bell, the toggle and the avatar (req 2)', () => {
    expect(shell).toMatch(/<input[^>]*type="search"/)
    for (const name of ['Bell_', 'ThemeToggle', 'Avatar']) expect(shell).toContain(`<${name} />`)
  })
  it('the theme choice is saved and read back, with the browser blocked case caught (req 3)', () => {
    expect(tools).toMatch(/localStorage\.setItem\('theme'/)
    expect(tools).toMatch(/localStorage\.getItem\('theme'\)/)
    expect(tools.match(/catch/g)?.length).toBeGreaterThanOrEqual(2)
  })
  it('the bell shows no invented items (req 4)', () => {
    expect(tools).toContain('Nothing is waiting')
    expect(tools).not.toMatch(/MOCK|Math\.random/)
    expect(tools).toMatch(/title="Not signed in"/)
  })
})
