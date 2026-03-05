import { Injectable } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { CliEncryptor } from '@shared/utils/encryptors/cli-encryptor'
import { TimeUtils } from '@shared/utils/time.utils'

@Injectable()
export class AuthService {
  constructor(private readonly user: UserContext) {}

  /**
   * @param duration in seconds
   * @returns string
   */
  async generateCliKey(duration: number): Promise<string> {
    const user = await this.user.loadEntity()
    const session = {
      user_id: this.user.id,
      username: this.user.dxuser,
      token: this.user.accessToken,
      expiration: Math.min(
        this.user.expiration,
        Math.round(TimeUtils.milisecondsToSeconds(Date.now()) + duration),
      ),
      org_id: user.organization.id,
    }
    return CliEncryptor.encrypt(session)
  }
}
