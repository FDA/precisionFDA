import { config, validation, errors } from '@pfda/https-apps-shared'
import { ValidationError } from '@pfda/https-apps-shared/src/errors'

// Predicate - all IP range numbers expected to be in range 0-255
// TODO(samuel) tuple type should be used instead of array
export const ipv4QuadrupleToBooleanArray = (ipv4Quadruple: number[]) =>
  ipv4Quadruple.map((n) => Array.from(n.toString(2).padStart(8)).map((c) => c === '1')).flat()

export const ipv4StringToQuadruple = (ipv4String: string | undefined) => {
  try {
    return validation.parsers.parseIpv4Address(ipv4String)
  } catch (validationError) {
    throw new errors.InvalidIpHeaderError(`Invalid IPv4 address parsed from '${config.api.fdaSubnet.nginxIpHeader}' header`, {
      //@ts-ignore
      validationError,
    })
  }
}
