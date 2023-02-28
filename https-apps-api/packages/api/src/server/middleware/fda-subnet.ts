import { config } from '@pfda/https-apps-shared'
import { ipv4QuadrupleToBooleanArray, ipv4StringToQuadruple } from '../../utils/ipv4'

// TODO(samuel) investigate if it's possible to have this logic on Nginx

// TODO: - Remove this middleware and extract this logic into a util function with unit tests
//       - Replace custom code with a package like ip-range-check?
//       - Should not return 400 if not in IP range, we just need to return enabled false
export const makeValidateFdaSubnetMdw = () => {
  const {
    ipv4Quadruple: cidrIpv4Quadruple,
    maskSize,
  } = config.api.fdaSubnet.allowedIpCidrBlock
  const cidrMaskPrefix = ipv4QuadrupleToBooleanArray(cidrIpv4Quadruple).slice(0, maskSize)
  return async (ctx: Api.Ctx, next: any) => {
    // Header added by Nginx
    const ipv4Header = ctx.get(config.api.fdaSubnet.nginxIpHeader)
    ctx.log.debug({ ipv4Header }, `Processing nginx header ${config.api.fdaSubnet.nginxIpHeader} with value "${ipv4Header}"`)
    // Client IP should be 1st value in provided list
    const ipv4String = ipv4Header.split(',')[0]
    ctx.log.debug({ ip: ipv4String }, 'Processing IP address')
    let incomingIpv4Bits
    try {
      incomingIpv4Bits = ipv4QuadrupleToBooleanArray(ipv4StringToQuadruple(ipv4String))
    } catch {
      const msg = `Expected request incoming from IPv4 requests, got ${
        ipv4String
      }. IPv6 isn't considered part of subnet as of now`
      ctx.log.error({ ip: ipv4String }, msg)
      // Temporary solution to avoid 500 errors showing up for the user
      ctx.status = 200
      ctx.body = { isEnabled: false }
      return
    }

    const actualMaskPrefix = incomingIpv4Bits.slice(0, maskSize)
    if (!cidrMaskPrefix.every((bit, index) => bit === actualMaskPrefix[index])) {
      const cidrBlockString = `${cidrIpv4Quadruple.join('.')}/${maskSize}`
      const msg = `Invalid IP address, expected IP to be in CIDR block ${cidrBlockString}, got ${ipv4String}`
      ctx.log.error({ ip: ipv4String }, msg)
      // Temporary solution to avoid 500 errors showing up for the user
      ctx.status = 200
      ctx.body = { isEnabled: false }
      return
    }
    ctx.log.debug({ ip: ipv4String }, 'IP address within CIDR block')
    // eslint-disable-next-line consistent-return
    return next()
  }
}
