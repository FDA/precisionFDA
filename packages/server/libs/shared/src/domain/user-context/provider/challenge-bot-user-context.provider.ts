import { SqlEntityManager } from '@mikro-orm/mysql'
import { FactoryProvider } from '@nestjs/common'
import { config } from '@shared/config'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'

export const CHALLENGE_BOT_USER_CONTEXT = 'CHALLENGE_BOT_USER_CONTEXT'

export const challengeBotUserContextProvider: FactoryProvider = {
  provide: CHALLENGE_BOT_USER_CONTEXT,
  inject: [SqlEntityManager],
  async useFactory(em: SqlEntityManager) {
    const challengeBot = await em.fork().findOne(User, {
      dxuser: config.platform.challengeBotUser,
    })

    return new UserContext(
      challengeBot ? challengeBot.id : null,
      config.platform.challengeBotAccessToken,
      config.platform.challengeBotUser,
    )
  },
}
