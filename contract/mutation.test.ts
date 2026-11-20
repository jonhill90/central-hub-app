import { describe, expect, it } from 'vitest'
import { validator } from './schema'

// A contract test must fail when a backend answer is wrong. These mutated answers
// must all be rejected by the schema check.
const area = { id: 'a', name: 'A', summary: 's', owner: 'o', docs: 'https://example.org', exit_path: 'e', status: 'ok' }

describe('the schema check rejects wrong answers', () => {
  const catalog = validator('Catalog')
  it('accepts a good catalog', () => expect(catalog({ areas: [area], rooms: [] }).ok).toBe(true))
  it('rejects a missing exit path', () => {
    const { exit_path: _drop, ...bad } = area
    expect(catalog({ areas: [bad], rooms: [] }).ok).toBe(false)
  })
  it('rejects an invented status', () => expect(catalog({ areas: [{ ...area, status: 'great' }], rooms: [] }).ok).toBe(false))
  it('rejects a non-https docs link', () => expect(catalog({ areas: [{ ...area, docs: 'http://x' }], rooms: [] }).ok).toBe(false))
  it('rejects an extra field such as a level', () => expect(catalog({ areas: [{ ...area, level: 3 }], rooms: [] }).ok).toBe(false))
  it('rejects an agent with nine sections', () => {
    const section = { title: 't', fields: [{ label: 'l', value: 'v' }] }
    const agent = { id: 'a', name: 'A', purpose: 'p', revision: '1', notes: '', sections: Array(9).fill(section) }
    expect(validator('Agents')({ agents: [agent] }).ok).toBe(false)
    expect(validator('Agents')({ agents: [{ ...agent, sections: Array(10).fill(section) }] }).ok).toBe(true)
  })
})
