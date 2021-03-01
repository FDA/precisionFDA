import { allPass, has, pick } from 'ramda'
import { errors } from '@pfda/https-apps-shared'

const hasEm = has('em')
const hasLog = has('log')
const hasUserData = has('user')
const hasAll = allPass([hasEm, hasLog, hasUserData])

export const pickOpsCtx = (koaCtx: Api.Ctx): Ops.OpsCtx => {
  if (hasAll(koaCtx)) {
    const ctx = pick(['em', 'log', 'user'])(koaCtx) as Ops.OpsCtx
    return ctx
  }
  throw new errors.InternalError('Cannot build operation context, wrong input')
}
