import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

// All - notify all members of the space
// Author - notify only the author of the discussion
// [...dxuser] - notify only the specified members
export type NotifyType = 'all' | 'author' | string[]

@ValidatorConstraint({ name: 'isValidNotify', async: false })
export class NotifyConstraint implements ValidatorConstraintInterface {
  validate(value: string | string[]) {
    if (typeof value === 'string') {
      return value === 'all' || value === 'author'
    }
    if (Array.isArray(value)) {
      return value.every((item) => typeof item === 'string')
    }
    return false
  }

  defaultMessage() {
    return `The 'notify' property must be either 'all', 'author', or a string array of usernames.`
  }
}
