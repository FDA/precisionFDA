import { JsonType } from '@mikro-orm/core'
import { isNil } from 'ramda'

// Usage
// @Property({ type: WorkaroundJsonType })
export class WorkaroundJsonType extends JsonType {
  convertToJSValue(value: string | null) {
    if (isNil(value)) {
      return value
    }

    return JSON.parse(value)
  }
}
