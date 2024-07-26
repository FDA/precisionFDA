import { Session } from '@shared/domain/session/session.entity'
import { User } from '@shared/domain/user/user.entity'
import { OpsCtx } from '@shared/types'
import { BaseOperation } from '@shared/utils/base-operation'

/**
 * Operation used for loading user by session id. It's a form of
 * authentication based on knowing the session key.
 */
class AuthSessionOperation extends BaseOperation<OpsCtx, string, User> {
  async run(key: string): Promise<User> {
    this.ctx.log.log('executing auth session operation')
    const em = this.ctx.em.fork()
    const session = await em.findOneOrFail(Session, { key }, { populate: ['user'] })
    return session.user.getEntity()
  }
}

export { AuthSessionOperation }
