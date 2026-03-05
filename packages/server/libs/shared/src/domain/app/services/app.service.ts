import { Injectable, Logger } from '@nestjs/common'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SearchableByUid } from '@shared/domain/entity/interface/searchable-by-uid.interface'
import { ErrorCodes, InvalidStateError, NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { App } from '../app.entity'
import { AppRepository } from '../app.repository'

@Injectable()
export class AppService implements SearchableByUid<'app'> {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly appRepository: AppRepository) {}

  getAccessibleEntityByUid(uid: Uid<'app'>): Promise<App | null> {
    return this.appRepository.findAccessibleOne({ uid })
  }

  getEditableEntityByUid(uid: Uid<'app'>): Promise<App | null> {
    return this.appRepository.findEditableOne({ uid })
  }

  getEditableEntityById(id: number): Promise<App | null> {
    return this.appRepository.findEditableOne({ id })
  }

  getAccessibleEntityById(id: number): Promise<App | null> {
    return this.appRepository.findAccessibleOne({ id })
  }

  async getValidAccessibleApp(uid: Uid<'app'>): Promise<App> {
    const app = await this.appRepository.findAccessibleOne({ uid })

    if (!app) {
      throw new NotFoundError(`App uid: ${uid} not found`, {
        code: ErrorCodes.APP_NOT_FOUND,
      })
    }

    if (app.deleted) {
      throw new InvalidStateError('App has been invalidated and cannot be run')
    }

    return app
  }
}
