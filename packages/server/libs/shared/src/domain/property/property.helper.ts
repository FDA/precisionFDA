import type { Collection } from '@mikro-orm/core'
import type { GeneralProperty } from './property.entity'

export function propertiesToRecord(properties: Collection<GeneralProperty>): Record<string, string> {
  const result: Record<string, string> = {}
  if (properties.isInitialized()) {
    for (const prop of properties.getItems()) {
      result[prop.propertyName] = prop.propertyValue
    }
  }
  return result
}
