// Patches some things that aren't working in @mikro-orm 4.5.9
// MySqlPlatform.convertsJsonAutomatically() returns true
// Which forbids conversion of 'text' mysql columns, that contain JSON values
// Which is result of using (possibly incorrectly) ActiveRecord in Ruby
// This workaround ensures that all JSON fields are parsed correctly

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

// TODO(samuel) create list of potential DB improvements
// * Migrate 'text' columns to 'json'
