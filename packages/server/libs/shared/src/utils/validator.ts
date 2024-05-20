import Ajv from 'ajv'

// removeAdditional is set on schema level
const ajv = new Ajv({ removeAdditional: false, coerceTypes: true })

export { ajv }
