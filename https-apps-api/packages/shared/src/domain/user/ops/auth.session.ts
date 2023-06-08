import { User } from '../user.entity'
import { Session } from '../../session'
import { BaseOperation } from '../../../utils'
import { UserOpsCtx } from '../../../types'

/**
 * Operation used for loading user by session id. It's a form of
 * authentication based on knowing the session key.
 */
class AuthSessionOperation extends BaseOperation<
UserOpsCtx,
string,
User
> {
  async run(key: string): Promise<User> {
    this.ctx.log.info('executing auth session operation')
    const em = this.ctx.em.fork()
    const session = await em.findOneOrFail(Session, { key }, { populate: ['user'] })
    return session.user.getEntity()
  }
}

export { AuthSessionOperation }
