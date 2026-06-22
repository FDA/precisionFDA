import { Injectable } from '@nestjs/common'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SearchableByUid } from '@shared/domain/entity/interface/searchable-by-uid.interface'
import { ErrorCodes, InvalidStateError, NotFoundError } from '@shared/errors'
import { App } from '../app.entity'
import { AppRepository } from '../app.repository'

type AppPopulateHint =
  | 'user'
  | 'user.organization'
  | 'appSeries'
  | 'appSeries.taggings.tag'
  | 'appSeries.properties'
  | 'assets'

@Injectable()
export class AppService implements SearchableByUid<'app'> {
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

  async getAccessibleRevisions(
    appSeriesId: number,
  ): Promise<
    Pick<App, 'id' | 'uid' | 'title' | 'revision' | 'version' | 'deleted'>[]
  > {
    const apps = await this.appRepository.findAccessible(
      { appSeriesId },
      {
        fields: ['id', 'uid', 'title', 'revision', 'version', 'deleted'],
        orderBy: { revision: 'DESC' },
      },
    )
    return apps
  }

  async getLatestAccessibleBySeriesId(appSeriesId: number): Promise<App | null> {
    const apps = await this.appRepository.findAccessible(
      { appSeriesId, deleted: false },
      {
        orderBy: { revision: 'DESC' },
      },
    )

    return apps[0] ?? null
  }

  /**
   * Populates the app entity with all relations needed for the detail view.
   */
  async populateForDetailView(app: App): Promise<void> {
    await this.appRepository.populate(
      app as App & Record<string, unknown>,
      [
        'user',
        'user.organization',
        'appSeries',
        'appSeries.taggings.tag',
        'appSeries.properties',
        'assets',
      ] as AppPopulateHint[],
    )
  }
}
