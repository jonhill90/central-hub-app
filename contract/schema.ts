// Shared by the contract tests: loads openapi/hub-api.yaml and builds validators
// from its schemas. Knows nothing about the app's own code.
import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import Ajv2020 from 'ajv/dist/2020'

export const spec = parse(readFileSync('openapi/hub-api.yaml', 'utf8')) as {
  openapi: string
  paths: Record<string, Record<string, unknown>>
  components: { schemas: Record<string, unknown> }
}

const ajv = new Ajv2020({ strict: false, allErrors: true })
for (const [name, schema] of Object.entries(spec.components.schemas)) {
  ajv.addSchema(schema as object, `#/components/schemas/${name}`)
}
// Refs inside schemas use '#/components/schemas/X'; resolve them by registering a root.
ajv.addSchema({ $id: 'hub', components: spec.components } as object)

export function validator(name: string) {
  const fn = ajv.compile({ $ref: `hub#/components/schemas/${name}` })
  return (data: unknown) => ({ ok: fn(data) as boolean, errors: fn.errors ?? [] })
}

export const BASE = (process.env.HUB_API_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '')
