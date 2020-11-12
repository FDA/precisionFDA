import Ajv from 'ajv'

const ajv = new Ajv({ removeAdditional: 'all', coerceTypes: true })

export { ajv }
