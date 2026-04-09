import { Injectable, Logger } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { RunAppDTO } from '@shared/domain/app/dto/run-app.dto'
import { AppService } from '@shared/domain/app/services/app.service'
import { CliRunAppDTO } from '@shared/domain/cli/dto/cli-run-app.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { STATIC_SCOPE } from '@shared/enums'
import { InvalidStateError } from '@shared/errors'
import { AppRunFacade } from '@shared/facade/app/app-run.facade'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { IOType } from '@shared/types/common'

/**
 * Facade to handle running applications via CLI.
 * At the moment, only HTTPS public apps can be run via CLI.
 */
@Injectable()
export class CliRunAppFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    private readonly appService: AppService,
    private readonly appRunFacade: AppRunFacade,
  ) {}

  async runApp(appUid: Uid<'app'>, body: CliRunAppDTO): Promise<{ id: Uid<'job'> }> {
    this.logger.log(`Running app ${appUid} for user ${this.user.dxuser} via CLI`)

    const app = await this.appService.getValidAccessibleApp(appUid)

    if (!app.isHTTPS() || !app.isPublic()) {
      throw new InvalidStateError(`Unable to start the app. Only public HTTPS app can be launched via CLI.`)
    }

    const user = await this.user.loadEntity()
    const input = this.prepareRunInput(app, body, user)

    return await this.appRunFacade.run(appUid, input)
  }

  private prepareRunInput(app: App, body: CliRunAppDTO, user: User): RunAppDTO {
    const userJobLimit = user.cloudResourceSettings.job_limit

    return {
      name: body.name ?? `${app.title}-cli`,
      scope: body.scope ?? STATIC_SCOPE.PRIVATE,
      instanceType: body.instanceType ?? 'baseline-2',
      jobLimit: body.jobLimit ?? userJobLimit,
      inputs: body.inputs ? ({ ...body.inputs } as Record<string, IOType>) : {},
      outputFolderPath: body.outputFolderPath ?? '',
    }
  }
}
