export type JsonPath = (string | number)[]

// TODO(samuel) add correct typing with TS template strings
export const buildJsonPath = (fields: JsonPath) =>
  fields.map((field) => 
    typeof field === 'number' ? `[${field}]` : `.${field}`,
  ).join('')
