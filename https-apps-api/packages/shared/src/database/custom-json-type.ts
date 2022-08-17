// Patches some things that aren't working in @mikro-orm 4.5.9
// MySqlPlatform.convertsJsonAutomatically() returns true
// Which forbids conversion of 'text' mysql columns, that contain JSON values
// Which is result of using (possibly incorrectly) ActiveRecord in Ruby
// This workaround ensures that all JSON fields are parsed correctly

import { JsonType } from '@mikro-orm/core'

// Usage
// @Property({ type: WorkaroundJsonType })
export class WorkaroundJsonType extends JsonType {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  convertToJSValue(value, platform) {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  }
}

// TODO(samuel) create list of potential DB improvements
// * Migrate 'text' columns to 'json'
