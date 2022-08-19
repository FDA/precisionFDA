import { allPass, has, pick } from 'ramda'
import { errors, types } from '@pfda/https-apps-shared'

const hasEm = has('em')
const hasLog = has('log')
const hasUserData = has('user')
const hasAll = allPass([hasEm, hasLog, hasUserData])

export const pickOpsCtx = (koaCtx: Api.Ctx): types.UserOpsCtx => {
  if (hasAll(koaCtx)) {
    const ctx = pick(['em', 'log', 'user'])(koaCtx) as types.UserOpsCtx
    return ctx
  }
  throw new errors.InternalError('Cannot build operation context, wrong input')
}
