import { RequestContext } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'

export class UserContext {
  constructor(
    readonly id: number,
    readonly accessToken: string,
    readonly dxuser: string,
    readonly sessionId?: string, // CLI doesn't deal with session id
    // sessionId was introduced for notifications to be sent to a given session id
    // and since CLI doesn't receive async notifications, we don't need to pass it
  ) {}

  async loadEntity(): Promise<User | null> {
    return RequestContext.getEntityManager().findOne(User, this.id)
  }
}
