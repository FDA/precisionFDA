import { Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { schemas } from '@shared/utils/base-schemas'
import { ajv } from '@shared/utils/validator'
import { ipv4QuadrupleToBooleanArray, ipv4StringToQuadruple } from '../utils/ipv4'

// TODO(samuel) investigate if it's possible to have this logic on Nginx

//       - Replace custom code with a package like ip-range-check?
export const isRequestFromFdaSubnet = (logger: Logger, ipv4Header: string): boolean => {
  if (config.devFlags.fda.skipFdaSubnetIpCheck) {
    logger.debug('Skipping FDA subnet IP check due to dev flag')
    return true
  }

  const { ipv4Quadruple: cidrIpv4Quadruple, maskSize } = config.api.fdaSubnet.allowedIpCidrBlock
  const cidrMaskPrefix = ipv4QuadrupleToBooleanArray(cidrIpv4Quadruple).slice(0, maskSize)

  logger.debug(
    { ipv4Header },
    `Processing nginx header ${config.api.fdaSubnet.nginxIpHeader} with value "${ipv4Header}"`,
  )
  // Client IP should be 1st value in provided list
  const ipv4String = ipv4Header.split(',')[0]
  logger.debug({ ip: ipv4String }, 'Processing IP address')
  let incomingIpv4Bits

  try {
    incomingIpv4Bits = ipv4QuadrupleToBooleanArray(ipv4StringToQuadruple(ipv4String))
  } catch {
    const msg = `Expected request incoming from IPv4 requests, got ${ipv4String}. IPv6 isn't considered part of subnet as of now`
    logger.error({ ip: ipv4String }, msg)
    return false
  }

  const actualMaskPrefix = incomingIpv4Bits.slice(0, maskSize)
  if (!cidrMaskPrefix.every((bit, index) => bit === actualMaskPrefix[index])) {
    const cidrBlockString = `${cidrIpv4Quadruple.join('.')}/${maskSize}`
    const msg =
      'Invalid IP address, expected IP to be in CIDR ' +
      `block ${cidrBlockString}, got ${ipv4String}`
    logger.error({ ip: ipv4String }, msg)
    return false
  }
  logger.debug({ ip: ipv4String }, 'IP address within CIDR block')
  return true
}
export const isRequestFromAuthenticatedUser = (headers: Record<string, string>): boolean => {
  const userContextValidatorFn = ajv.compile(schemas.userContextSchema)
  return userContextValidatorFn(headers) as boolean
}
