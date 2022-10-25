import { config, errors } from '@pfda/https-apps-shared'
import { ipv4QuadrupleToBooleanArray, ipv4StringToQuadruple } from '../../utils/ipv4'

export const makeValidateFdaSubnetMdw = () => {
  const {
    ipv4Quadruple: cidrIpv4Quadruple,
    maskSize,
  } = config.api.fdaSubnet.allowedIpCidrBlock
  const cidrMaskPrefix = ipv4QuadrupleToBooleanArray(cidrIpv4Quadruple).slice(0, maskSize)
  const cidrBlockString = `${cidrIpv4Quadruple.join('')}/${maskSize}`
  return async (ctx: Api.Ctx, next) => {
    // Header added by Nginx
    const ipv4String = ctx.get(config.api.fdaSubnet.nginxIpHeader)
    ctx.log.debug({ ip: ipv4String }, 'Processing IP address')
    const incomingIpv4Bits = ipv4QuadrupleToBooleanArray(ipv4StringToQuadruple(ipv4String))
    const actualMaskPrefix = incomingIpv4Bits.slice(0, maskSize)
    if (!cidrMaskPrefix.every((bit, index) => bit === actualMaskPrefix[index])) {
      throw new errors.InvalidIpHeaderError(`
        Invalid IP address, expected IP to be in CIDR block ${cidrBlockString}, got "${ipv4String}"
      `)
    }
    ctx.log.debug({ ip: ipv4String }, 'IP address within CIDR block')
    return next()
  }
}
