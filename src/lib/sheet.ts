// Pure sheet logic: validation and the view model. No file access here.
export const REQUIRED = [
  'schema', 'id', 'name', 'revision', 'owner', 'purpose', 'runtime', 'capabilities',
  'equipment', 'authority', 'budgets', 'memory', 'interface', 'coordination', 'lifecycle', 'evaluations',
] as const

const SECRET_KEY = /(^|_)(password|secret|api_?key|token_value|private_key)($|_)/i
const SECRET_VALUE = /^(sk-|ghp_|github_pat_)/

type Sheet = Record<string, unknown>

function walk(v: unknown, path: string, out: string[]) {
  if (typeof v === 'string' && SECRET_VALUE.test(v.trim())) out.push(`${path}: looks like a credential`)
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`, out))
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (SECRET_KEY.test(k)) out.push(`${path}.${k}: secret-looking key; reference a mode, never the secret`)
      walk(x, `${path}.${k}`, out)
    }
  }
}

export function validateSheet(items: { file: string; sheet: Sheet }[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const { file, sheet } of items) {
    for (const k of REQUIRED) if (!(k in sheet) || sheet[k] === null || sheet[k] === undefined) problems.push(`${file}: missing ${k}`)
    const id = String(sheet.id ?? '')
    if (id && file.replace(/\.md$/, '') !== id) problems.push(`${file}: id ${id} does not match the file name`)
    if (id && seen.has(id)) problems.push(`${file}: duplicate id ${id}`)
    seen.add(id)
    walk(sheet, file, problems)
  }
  return problems
}

export interface Field { label: string; value: string }
export interface Section { title: string; fields: Field[] }
export interface AgentView {
  id: string
  name: string
  purpose: string
  revision: string
  notes: string
  sections: Section[]
}

/** Anything absent, empty or `unknown` is shown as `unknown`, never as zero or a guess. */
export function show(v: unknown): string {
  if (v === undefined || v === null || v === '' || v === 'unknown') return 'unknown'
  if (Array.isArray(v)) return v.length === 0 ? 'none listed' : v.map(show).join('; ')
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>).map(([k, x]) => `${k}: ${show(x)}`).join(', ')
  }
  return String(v)
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})
const fields = (o: Record<string, unknown>, keys: string[]): Field[] => keys.map((k) => ({ label: k.replace(/_/g, ' '), value: show(o[k]) }))

export function toView(sheet: Sheet): AgentView {
  const caps = obj(sheet.capabilities)
  return {
    id: String(sheet.id),
    name: String(sheet.name),
    purpose: show(sheet.purpose),
    revision: show(sheet.revision),
    notes: typeof sheet.notes === 'string' ? sheet.notes : '',
    sections: [
      { title: 'Identity', fields: [{ label: 'id', value: show(sheet.id) }, { label: 'revision', value: show(sheet.revision) }, { label: 'owner', value: show(sheet.owner) }, { label: 'purpose', value: show(sheet.purpose) }] },
      { title: 'Runtime', fields: fields(obj(sheet.runtime), ['harness', 'model', 'fallbacks', 'auth_mode', 'host']) },
      { title: 'Capabilities', fields: [{ label: 'methods', value: show(caps.methods) }, { label: 'skills', value: show(caps.skills) }] },
      { title: 'Equipment', fields: [{ label: 'tools', value: show(sheet.equipment) }] },
      { title: 'Authority (ceiling)', fields: fields(obj(sheet.authority), ['sandbox', 'read', 'write', 'network', 'needs_approval']) },
      { title: 'Budgets', fields: fields(obj(sheet.budgets), ['tokens', 'money', 'wall_time', 'retries', 'on_exhaustion']) },
      { title: 'Memory and knowledge', fields: fields(obj(sheet.memory), ['reads_at_start', 'writes_to']) },
      { title: 'Interface and handoff', fields: fields(obj(sheet.interface), ['accepts', 'returns', 'handoff']) },
      { title: 'Coordination and lifecycle', fields: [...fields(obj(sheet.coordination), ['dispatched_by', 'reviewed_by', 'must_not_duplicate']), { label: 'lifecycle', value: show(sheet.lifecycle) }] },
      { title: 'Evaluations', fields: [{ label: 'receipts', value: show(sheet.evaluations) }] },
    ],
  }
}
