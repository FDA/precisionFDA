/**
 * Same pattern as `User::EMAIL_FORMAT` in `packages/rails/app/models/user.rb`
 * (Rails `validate_email` / profile email validations).
 */
const PRECISION_EMAIL_FORMAT = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))$/

export function isValidPrecisionEmailFormat(email: string): boolean {
  return PRECISION_EMAIL_FORMAT.test(email)
}
