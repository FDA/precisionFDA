import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { CliExchangeEncryptor } from '@shared/domain/cli-exchange-token/cli-exchange-encryptor/cli-exchange-encryptor'
import { CliExchangeTokenService } from '@shared/domain/cli-exchange-token/services/cli-exchange-token.service'
import { CliExchangeTokenOutputDTO } from '@shared/domain/cli/dto/cli-exchange-token-output.dto'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { InvalidStateError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { SCOPE } from '@shared/types/common'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class CliExchangeFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
    private readonly cliExchangeTokenService: CliExchangeTokenService,
  ) {}

  async exchangeCLIToken(code: string): Promise<CliExchangeTokenOutputDTO> {
    this.logger.log(`Exchanging CLI token with code: ${code}`)
    const exchangeToken = await this.cliExchangeTokenService.getExchangeCliTokenByCode(code)

    await this.validateJob(exchangeToken.scope, exchangeToken.dxid)

    const cliConfigs = CliExchangeEncryptor.decrypt(
      exchangeToken.encryptedKey,
      config.job.tokenEncryptionKey,
      exchangeToken.salt,
    )
    await this.em.remove(exchangeToken).flush()
    return { exchangeToken: Buffer.from(cliConfigs).toString('base64') }
  }

  // Jobs in shared spaces could be addressed inputs by other users
  // Users could potentially exchange CLI tokens for jobs they do not own
  // Hence we restrict CLI exchange to only running jobs in shared spaces
  private async validateJob(scope: SCOPE, jobDxId: DxId<'job'>): Promise<void> {
    this.logger.log(`Validating job for CLI exchange with dxid: ${jobDxId} and scope: ${scope}`)
    if (EntityScopeUtils.isSpaceScope(scope)) {
      const jobDescribe = await this.adminClient.jobDescribe({ jobDxId })
      if (jobDescribe.state !== JOB_STATE.RUNNING) {
        throw new InvalidStateError('Job is not in running state')
      }
    }
  }
}
