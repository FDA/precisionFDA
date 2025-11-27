import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { UBUNTU_20, UBUNTU_RELEASES, VALID_IO_CLASSES } from '@shared/config/consts'
import { validUbuntuPackages } from '@shared/config/ubuntu_packages'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { AppSeriesRepository } from '@shared/domain/app-series/app-series.repository'
import { SaveAppDto } from '@shared/domain/app/dto/save-app.dto'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SearchableByUid } from '@shared/domain/entity/interface/searchable-by-uid.interface'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import {
  ErrorCodes,
  InvalidRequestError,
  NotFoundError,
  PermissionError,
  ValidationError,
} from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import {
  AppCreateParams,
  AppletCreateParams,
  PackageMapping,
} from '@shared/platform-client/platform-client.params'
import { EntityScope } from '@shared/types/common'
import { codeRemap } from '@shared/utils/app'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import * as crypto from 'crypto'
import { createAppCreated } from '../../event/event.helper'
import { allowedInstanceTypes } from '../../job/job.enum'
import { AssetRepository } from '../../user-file/asset.repository'
import { App, AppSpec, Internal } from '../app.entity'
import { ENTITY_TYPE } from '../app.enum'
import { constructDxid, constructDxName } from '../app.helper'
import { PlatformSpec, Spec } from '../app.input'
import { AppRepository } from '../app.repository'

@Injectable()
export class AppService implements SearchableByUid<'app'> {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly assetRepository: AssetRepository,
    private readonly appSeriesRepository: AppSeriesRepository,
    private readonly appRepository: AppRepository,
  ) {}

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

  private validateSpec(spec: Spec, type: string, alreadySeenSpec: string[]): void {
    if (!spec.name || spec.name.length === 0) {
      this.throwValidationError(`The ${type} name cannot be empty.`)
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(spec.name)) {
      this.throwValidationError(
        `The ${type} name \'${spec.name}\' can only contain the characters A-Z, a-z, 0-9, ` +
          "'.' (period), '_' (underscore) and '-' (dash).",
      )
    }

    if (alreadySeenSpec.includes(spec.name)) {
      this.throwValidationError(`Duplicate definitions for ${type} named ${spec.name}.`)
    }
    alreadySeenSpec.push(spec.name)

    if (!spec.class || spec.class.length === 0) {
      this.throwValidationError(`The ${type} named ${spec.name} is missing type.`)
    }

    if (!VALID_IO_CLASSES.includes(spec.class)) {
      this.throwValidationError(`The ${type} named ${spec.name} contains invalid type.`)
    }
  }

  private throwValidationError(message: string): void {
    this.logger.error(message)
    throw new ValidationError(message)
  }

  private async validateAppInput(appInput: SaveAppDto): Promise<void> {
    this.logger.log('Starting app validations')

    if (!UBUNTU_RELEASES.includes(appInput.release)) {
      this.throwValidationError(`Unacceptable release ${appInput.release}`)
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(appInput.name)) {
      this.throwValidationError(
        "The app 'name' can only contain the characters A-Z, a-z, 0-9, " +
          "'.' (period), '_' (underscore) and '-' (dash).",
      )
    }

    if (!Object.keys(allowedInstanceTypes).includes(appInput.instance_type)) {
      this.throwValidationError(
        `The app 'instance type' must be one of: ${Object.keys(allowedInstanceTypes)}`,
      )
    }

    appInput.packages.forEach((packageName) => {
      if (!validUbuntuPackages.includes(packageName)) {
        this.throwValidationError(`The package '${packageName}' is not a valid Ubuntu package.`)
      }
    })

    if (appInput.ordered_assets) {
      let inaccessible = [...appInput.ordered_assets]
      const assets = await this.getAssets(appInput.ordered_assets)
      assets.forEach((asset) => (inaccessible = inaccessible.filter((item) => item !== asset.uid)))
      if (inaccessible.length > 0) {
        this.throwValidationError(
          `The app assets with uids '${JSON.stringify(inaccessible)}' do ` +
            'not exist or are not accessible by you.',
        )
      }
    }

    const alreadySeenInputs: string[] = []
    appInput.input_spec.forEach((spec) => this.validateSpec(spec, 'input', alreadySeenInputs))
    const alreadySeenOutputs: string[] = []
    appInput.output_spec.forEach((spec) => this.validateSpec(spec, 'output', alreadySeenOutputs))

    this.logger.log('App validations finished successfully')
  }

  private async validateScopeAndUser(user: User, scope: EntityScope): Promise<void> {
    if (scope === STATIC_SCOPE.PUBLIC && !(await user.isSiteAdmin())) {
      throw new PermissionError('Only site admins can create public apps.')
    }
    if (EntityScopeUtils.isSpaceScope(scope)) {
      const editableSpaces = await user.editableSpaces()
      if (!editableSpaces.map((space) => space.scope).includes(scope)) {
        throw new PermissionError(
          `User ${user.dxuser} does not have permission to create app in space ${scope}.`,
        )
      }
    }
  }

  private validateAppSeriesCreation(appSeries?: AppSeries, createAppSeries?: boolean): void {
    if (!appSeries && !createAppSeries) {
      throw new ValidationError(
        'This would create a new app series and client did not request its creation.',
        {
          code: ErrorCodes.APP_SERIES_CREATION_NOT_REQUESTED,
        },
      )
    }
  }

  private async validateForkedApp(forkFrom?: Uid<'app'>): Promise<void> {
    if (forkFrom) {
      const forkedApp = await this.appRepository.findAccessibleOne({ uid: forkFrom })

      if (!forkedApp) {
        throw new NotFoundError('Forked app does not exist or is not accessible.')
      }

      if (forkedApp.entityType === ENTITY_TYPE.HTTPS) {
        throw new InvalidRequestError('Forking from this app is not allowed.')
      }
    }
  }

  private validateAppRevisionCreation(appSeries?: AppSeries, createAppRevision?: boolean): void {
    if (appSeries && !createAppRevision) {
      throw new ValidationError(
        'This would create a new app revision and client did not request its creation.',
        {
          code: ErrorCodes.APP_REVISION_CREATION_NOT_REQUESTED,
        },
      )
    }
  }

  private getAssetDxids(assets: Asset[]): DxId<'file'>[] {
    return assets.map((asset) => asset.dxid)
  }

  private getEntityType(entityType: string): ENTITY_TYPE {
    if (entityType && entityType === 'https') {
      return ENTITY_TYPE.HTTPS
    } else {
      return ENTITY_TYPE.NORMAL
    }
  }

  private async getAssets(orderedAssets: Uid<'file'>[]): Promise<Asset[]> {
    if (orderedAssets) {
      const user = await this.user.loadEntity()
      const accessibleSpaceIds = await user.accessibleSpaceIds()
      return await this.assetRepository.findAccessibleByUser(
        this.user.id,
        orderedAssets,
        accessibleSpaceIds,
      )
    } else {
      return []
    }
  }

  private async getAppSeries(appName: string, scope: EntityScope): Promise<AppSeries> {
    return await this.appSeriesRepository.findOne({
      name: appName,
      scope: scope,
      user: this.user.id,
    })
  }

  private async createAppSeries(
    appName: string,
    user: User,
    scope?: EntityScope,
  ): Promise<AppSeries> {
    const appSeriesDxid = constructDxid(this.user.dxuser, appName, scope)
    const appSeries = new AppSeries(user)
    appSeries.name = appName
    appSeries.dxid = appSeriesDxid
    appSeries.scope = scope
    this.logger.log(`Creating app series ${appSeries.dxid}`)
    await this.em.persistAndFlush(appSeries)
    return appSeries
  }

  private async getAppRevision(latestRevisionAppId?: number): Promise<number> {
    const latestRevisionApp = await this.appRepository.findOne({ id: latestRevisionAppId })
    if (latestRevisionApp) {
      return latestRevisionApp.revision + 1
    }
    return 1
  }

  /**
   * Some attributes are only for pfda and not acceptable by platform.
   * @param pfdaSpecs
   * @private
   */
  private remapPfdaSpecToPlatformSpec(pfdaSpecs: Spec[]): PlatformSpec[] {
    return pfdaSpecs.map((pfdaSpec) => {
      return {
        class: pfdaSpec.class,
        help: pfdaSpec.help,
        label: pfdaSpec.label,
        name: pfdaSpec.name,
        optional: pfdaSpec.optional,
      } as PlatformSpec
    })
  }

  /**
   * Creates applet and returns its id.
   * @param user
   * @param appInput
   * @param release
   */
  private async createApplet(
    user: User,
    appInput: SaveAppDto,
    release: string,
  ): Promise<DxId<'applet'>> {
    this.logger.log('Creating applet in platform')
    const appletCreateParams: AppletCreateParams = {
      project: user.privateFilesProject,
      inputSpec: this.remapPfdaSpecToPlatformSpec(appInput.input_spec),
      outputSpec: this.remapPfdaSpecToPlatformSpec(appInput.output_spec),
      runSpec: {
        code: codeRemap(appInput.code),
        interpreter: 'bash',
        systemRequirements: {
          '*': { instanceType: allowedInstanceTypes[appInput.instance_type] },
        },
        distribution: 'Ubuntu',
        version: '0',
        release,
        execDepends: appInput.packages.map((pckg) => {
          return { name: pckg } as PackageMapping
        }),
      },
      dxapi: '1.0.0',
      access: appInput.internet_access ? { network: ['*'] } : {},
    }
    const appletCreateResponse = await this.platformClient.appletCreate(appletCreateParams)
    this.logger.log(`Applet with id ${appletCreateResponse.id} created successfully`)
    return appletCreateResponse.id as DxId<'applet'>
  }

  private async createAppInPlatform(
    appletId: string,
    appInput: SaveAppDto,
    revision: number,
    user: User,
    assets: Asset[],
  ): Promise<DxId<'app'>> {
    this.logger.log(`Creating app in platform for applet id ${appletId}`)
    const assetDxids = this.getAssetDxids(assets)
    const appCreateParams: AppCreateParams = {
      applet: appletId,
      name: constructDxName(user.dxuser, appInput.name, appInput.scope),
      title: appInput.title,
      summary: ' ',
      description: appInput.readme && appInput.readme.length > 1 ? appInput.readme : ' ',
      version: `r${revision}-${crypto.randomBytes(3).toString('hex')}`,
      resources: assetDxids,
      details: { ordered_assets: assetDxids },
      openSource: false,
      billTo: user.organization.getEntity().getDxOrg(),
      access: appInput.internet_access ? { network: ['*'] } : {},
    }
    const appCreateResponse = await this.platformClient.appCreate(appCreateParams)
    this.logger.log(
      `App with id ${appCreateResponse.id} for applet id ${appletId} created successfully`,
    )
    return appCreateResponse.id
  }

  private async createAppEvent(user: User, app: App): Promise<void> {
    this.logger.log(`Creating app event for app ${app.uid} and user ${user.id}`)
    const createAppEvent = await createAppCreated(user, app)
    await this.em.persistAndFlush(createAppEvent)
  }

  private async updateAppSeries(
    appSeries: AppSeries,
    appInput: SaveAppDto,
    app: App,
  ): Promise<void> {
    this.logger.log(`Updating app series ${appSeries.dxid}`)
    appSeries.latestRevisionAppId = app.id
    if (appInput.scope && appInput.scope !== STATIC_SCOPE.PRIVATE) {
      appSeries.latestVersionAppId = app.id
    }
    if (appSeries.deleted) {
      appSeries.deleted = false
    }
    if (!appSeries.scope) {
      appSeries.scope = appInput.scope
    }
  }

  private stripChoices = (spec: Spec[]): Spec[] => {
    return spec.map((s) => {
      if (s.choices && s.choices.length === 0) {
        delete s.choices
      }
      return s
    })
  }

  private async saveAppInDB(
    user: User,
    platformAppId: DxId<'app'>,
    revision: number,
    release: string,
    assets: Asset[],
    appInput: SaveAppDto,
    appSeriesId: number,
  ): Promise<App> {
    this.logger.log(`Saving app in DB with platformAppId: ${platformAppId}`)
    const app = new App(user)
    app.dxid = platformAppId
    app.uid = `${app.dxid}-${revision}`
    app.revision = revision
    app.title = appInput.title
    app.readme = appInput.readme
    app.entityType = this.getEntityType(appInput.entity_type)
    app.scope = appInput.scope
    app.forkedFrom = appInput.forked_from ?? null
    app.appSeriesId = appSeriesId
    app.spec = {
      input_spec: this.stripChoices(appInput.input_spec),
      output_spec: this.stripChoices(appInput.output_spec),
      internet_access: appInput.internet_access,
      instance_type: appInput.instance_type,
    } as AppSpec
    app.internal = {
      ...(assets.length > 0 && { ordered_assets: assets.map((asset) => asset.uid) }),
      packages: appInput.packages,
      code: appInput.code,
    } as Internal

    assets.forEach((asset) => app.assets.add(asset))
    app.release = release
    await this.em.persistAndFlush(app)
    return app
  }

  /**
   * Creates app in database and platform.
   * @param appInput properties of newly created app
   * @return uid of newly created app
   */
  async create(appInput: SaveAppDto): Promise<Uid<'app'>> {
    this.logger.log(
      `Creating app for user: ${this.user.dxuser}, createAppSeries ${appInput.createAppSeries}`,
    )
    await this.validateAppInput(appInput)
    await this.em.begin()
    try {
      const user = await this.em.findOneOrFail(
        User,
        { id: this.user.id },
        { populate: ['organization'] },
      )
      const assets = await this.getAssets(appInput.ordered_assets ? appInput.ordered_assets : [])

      await this.validateScopeAndUser(user, appInput.scope)
      await this.validateForkedApp(appInput.forked_from as Uid<'app'>)
      // - create app series
      let appSeries = await this.getAppSeries(appInput.name, appInput.scope)
      this.validateAppSeriesCreation(appSeries, appInput.createAppSeries)
      this.validateAppRevisionCreation(appSeries, appInput.createAppRevision)
      if (!appSeries && appInput.createAppSeries) {
        appSeries = await this.createAppSeries(appInput.name, user, appInput.scope)
        this.logger.log(
          `App series for dxid ${appSeries.dxid} did not exist and user requested its creation`,
        )
      }

      // - get release
      const release = appInput.release ? appInput.release : UBUNTU_20

      // - find the latest revision and increase it by one
      const revision = await this.getAppRevision(appSeries.latestRevisionAppId)

      // - create new applet in platform
      const appletId = await this.createApplet(user, appInput, release)

      // - create new app in platform
      const platformAppId = await this.createAppInPlatform(
        appletId,
        appInput,
        revision,
        user,
        assets,
      )

      // - remove project objects (what the hell does this do???)
      if (user.privateFilesProject) {
        await this.platformClient.containerRemoveObjects(user.privateFilesProject, [appletId])
      }
      // - store app in a database
      const app = await this.saveAppInDB(
        user,
        platformAppId,
        revision,
        release,
        assets,
        appInput,
        appSeries.id,
      )

      // - update app series (version, revision, deleted - why?)
      await this.updateAppSeries(appSeries, appInput, app)

      // - store app event
      await this.createAppEvent(user, app)

      await this.em.commit()
      return app.uid
    } catch (error) {
      this.logger.error('Error creating an app', error)
      await this.em.rollback()
      throw error
    }
  }
}
