import * as crypto from 'node:crypto'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { UBUNTU_20, UBUNTU_RELEASES, VALID_IO_CLASSES } from '@shared/config/consts'
import { validUbuntuPackages } from '@shared/config/ubuntu_packages'
import { App, AppSpec, Internal } from '@shared/domain/app/app.entity'
import { ENTITY_TYPE } from '@shared/domain/app/app.enum'
import {
  APPKIT_LATEST_VERSION,
  constructDxName,
  getCLIKeyInputSpec,
  getEntityType,
  remapPfdaSpecToPlatformSpec,
  stripChoices,
} from '@shared/domain/app/app.helper'
import { AppSpecItem } from '@shared/domain/app/app.input'
import { SaveAppDTO } from '@shared/domain/app/dto/save-app.dto'
import { AppService } from '@shared/domain/app/services/app.service'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { AppSeriesService } from '@shared/domain/app-series/service/app-series.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { createAppCreated } from '@shared/domain/event/event.helper'
import { allowedInstanceTypes } from '@shared/domain/job/job.enum'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { ErrorCodes, InvalidRequestError, NotFoundError, PermissionError, ValidationError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { AppCreateParams, AppletCreateParams, PackageMapping } from '@shared/platform-client/platform-client.params'
import { EntityScope } from '@shared/types/common'
import { codeRemap } from '@shared/utils/app'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class AppCreateFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly nodeService: NodeService,
    private readonly appService: AppService,
    private readonly appSeriesService: AppSeriesService,
  ) {}

  /**
   * Creates app in database and platform.
   * @param appInput properties of newly created app
   * @return uid of newly created app
   */
  async create(appInput: SaveAppDTO): Promise<Uid<'app'>> {
    this.logger.log(`Creating app for user: ${this.user.dxuser}, createAppSeries ${appInput.createAppSeries}`)
    const user = await this.user.loadEntity()
    await this.em.populate(user, ['organization'])
    const assets = (await this.nodeService.getAccessibleEntitiesByUids(appInput.ordered_assets ?? [], [
      FILE_STI_TYPE.ASSET,
    ])) as Asset[]

    await this.validateAppInput(appInput, assets)
    await this.validateScopeAndUser(user, appInput.scope)
    await this.validateForkedApp(appInput.forked_from as Uid<'app'>)
    // - create app series
    let appSeries = await this.appSeriesService.getAppSeriesByName(appInput.name, appInput.scope)
    this.validateAppSeriesCreation(appSeries, appInput.createAppSeries)
    this.validateAppRevisionCreation(appSeries, appInput.createAppRevision)

    const previousVersionAppDxid = appSeries ? (await this.getLatestRevisionApp(appSeries)).dxid : null
    if (!appSeries && appInput.createAppSeries) {
      appSeries = await this.appSeriesService.createAppSeries(appInput.name, user, appInput.scope)
      this.logger.log(`App series for dxid ${appSeries.dxid} did not exist and user requested its creation`)
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
      previousVersionAppDxid,
    )

    // - remove applet object from user's private files project
    if (user.privateFilesProject) {
      await this.platformClient.containerRemoveObjects(user.privateFilesProject, [appletId])
    }

    if (EntityScopeUtils.isSpaceScope(appInput.scope)) {
      await this.publishAppInSpace(user, EntityScopeUtils.getSpaceIdFromScope(appInput.scope), platformAppId)
    }

    await this.em.begin()
    try {
      // - store app in a database
      const app = await this.saveAppInDB(user, platformAppId, revision, release, assets, appInput, appSeries.id)

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

  private async publishAppInSpace(user: User, spaceId: number, appDxid): Promise<void> {
    const space = (await user.editableSpaces()).find(space => space.id === spaceId)

    if (!space) {
      // this should never happen due to prior validation
      throw new NotFoundError(`Space with id ${spaceId} not found`)
    }

    const belongOrgs = []
    if (space.hostDxOrg) {
      belongOrgs.push(space.hostDxOrg)
    }
    if (space.guestDxOrg) {
      belongOrgs.push(space.guestDxOrg)
    }
    await this.platformClient.appAddAuthorizedUsers({ appId: appDxid, authorizedUsers: belongOrgs })
    await this.platformClient.appPublish({ appId: appDxid, makeDefault: false })
  }

  private async createAppEvent(user: User, app: App): Promise<void> {
    this.logger.log(`Creating app event for app ${app.uid} and user ${user.id}`)
    const createAppEvent = await createAppCreated(user, app)
    await this.em.persist(createAppEvent).flush()
  }

  private async updateAppSeries(appSeries: AppSeries, appInput: SaveAppDTO, app: App): Promise<void> {
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

  private async saveAppInDB(
    user: User,
    platformAppId: DxId<'app'>,
    revision: number,
    release: string,
    assets: Asset[],
    appInput: SaveAppDTO,
    appSeriesId: number,
  ): Promise<App> {
    this.logger.log(`Saving app in DB with platformAppId: ${platformAppId}`)
    const app = new App(user)
    app.dxid = platformAppId
    app.uid = `${app.dxid}-${revision}`
    app.version = APPKIT_LATEST_VERSION
    app.revision = revision
    app.title = appInput.title
    app.readme = appInput.readme
    app.entityType = getEntityType(appInput.entity_type)
    app.scope = appInput.scope
    app.forkedFrom = appInput.forked_from ?? null
    app.appSeriesId = appSeriesId
    app.spec = {
      input_spec: stripChoices(appInput.input_spec),
      output_spec: stripChoices(appInput.output_spec),
      internet_access: appInput.internet_access,
      instance_type: appInput.instance_type,
    } as AppSpec
    app.internal = {
      ...(assets.length > 0 && { ordered_assets: assets.map(asset => asset.uid) }),
      packages: appInput.packages,
      code: appInput.code,
    } as Internal

    assets.forEach(asset => app.assets.add(asset))
    app.release = release
    await this.em.persist(app).flush()
    return app
  }

  private async createAppInPlatform(
    appletId: string,
    appInput: SaveAppDTO,
    revision: number,
    user: User,
    assets: Asset[],
    previousVersionAppDxid?: DxId<'app'>,
  ): Promise<DxId<'app'>> {
    this.logger.log(`Creating app in platform for applet id ${appletId}`)

    const appDxName = constructDxName(user.dxuser, appInput.name, appInput.scope)
    const currentBillTo = user.organization.getEntity().getDxOrg()
    const assetDxids = assets.map(asset => asset.dxid)

    // It is not possible on the PLATFORM to change billTo while creating a new version of an app.
    // It has to be changed independently with an update after the new version is created.
    const previousBillTo = previousVersionAppDxid
      ? (await this.platformClient.appDescribe(previousVersionAppDxid)).billTo
      : undefined

    const appCreateParams: AppCreateParams = {
      applet: appletId,
      name: appDxName,
      title: appInput.title,
      summary: ' ',
      description: appInput.readme?.length > 1 ? appInput.readme : ' ',
      version: `r${revision}-${crypto.randomBytes(3).toString('hex')}`,
      resources: assetDxids,
      details: { ordered_assets: assetDxids },
      openSource: false,
      billTo: previousBillTo ?? currentBillTo,
      access: appInput.internet_access ? { network: ['*'] } : {},
    }

    const { id: appDxId } = await this.platformClient.appCreate(appCreateParams)

    // set billTo to current org if it changed for the new version
    if (previousBillTo && previousBillTo !== currentBillTo) {
      await this.platformClient.appUpdate(appDxId, { billTo: currentBillTo })
    }

    this.logger.log(`App with id ${appDxId} for applet id ${appletId} created successfully`)
    return appDxId
  }

  /**
   * Creates applet and returns its id.
   * @param user
   * @param appInput
   * @param release
   */
  private async createApplet(user: User, appInput: SaveAppDTO, release: string): Promise<DxId<'applet'>> {
    this.logger.log('Creating applet in platform')
    const appletCreateParams: AppletCreateParams = {
      project: user.privateFilesProject,
      inputSpec: remapPfdaSpecToPlatformSpec(appInput.input_spec).concat(
        appInput.internet_access ? getCLIKeyInputSpec() : [],
      ),
      outputSpec: remapPfdaSpecToPlatformSpec(appInput.output_spec),
      runSpec: {
        code: codeRemap(appInput.code, appInput.internet_access),
        interpreter: 'bash',
        systemRequirements: {
          '*': { instanceType: allowedInstanceTypes[appInput.instance_type], nvidiaDriver: 'R535' },
        },
        distribution: 'Ubuntu',
        version: '0',
        release,
        execDepends: appInput.packages.map(pckg => {
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

  private async getAppRevision(latestRevisionAppId?: number): Promise<number> {
    const latestRevisionApp = await this.appService.getEditableEntityById(latestRevisionAppId)
    if (latestRevisionApp) {
      return latestRevisionApp.revision + 1
    }
    return 1
  }

  private async getLatestRevisionApp(appSeries: AppSeries): Promise<App> {
    const appId = appSeries.latestRevisionAppId
    return this.appService.getEditableEntityById(appId)
  }

  private validateAppRevisionCreation(appSeries?: AppSeries, createAppRevision?: boolean): void {
    if (appSeries && !createAppRevision) {
      throw new ValidationError('This would create a new app revision and client did not request its creation.', {
        code: ErrorCodes.APP_REVISION_CREATION_NOT_REQUESTED,
      })
    }
  }

  private validateAppSeriesCreation(appSeries?: AppSeries, createAppSeries?: boolean): void {
    if (!appSeries && !createAppSeries) {
      throw new ValidationError('This would create a new app series and client did not request its creation.', {
        code: ErrorCodes.APP_SERIES_CREATION_NOT_REQUESTED,
      })
    }
  }

  private async validateForkedApp(forkFrom?: Uid<'app'>): Promise<void> {
    if (forkFrom) {
      const forkedApp = await this.appService.getAccessibleEntityByUid(forkFrom)

      if (!forkedApp) {
        throw new NotFoundError('Forked app does not exist or is not accessible.')
      }

      if (forkedApp.entityType === ENTITY_TYPE.HTTPS) {
        throw new InvalidRequestError('Forking from this app is not allowed.')
      }
    }
  }

  private async validateScopeAndUser(user: User, scope: EntityScope): Promise<void> {
    if (scope === STATIC_SCOPE.PUBLIC && !(await user.isSiteAdmin())) {
      throw new PermissionError('Only site admins can create public apps.')
    }
    if (EntityScopeUtils.isSpaceScope(scope)) {
      const editableSpaces = await user.editableSpaces()
      if (!editableSpaces.map(space => space.scope).includes(scope)) {
        throw new PermissionError(`User ${user.dxuser} does not have permission to create app in space ${scope}.`)
      }
    }
  }

  private async validateAppInput(appInput: SaveAppDTO, assets: Asset[]): Promise<void> {
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
      this.throwValidationError(`The app 'instance type' must be one of: ${Object.keys(allowedInstanceTypes)}`)
    }

    appInput.packages.forEach(packageName => {
      if (!validUbuntuPackages.includes(packageName)) {
        this.throwValidationError(`The package '${packageName}' is not a valid Ubuntu package.`)
      }
    })

    if (appInput.ordered_assets) {
      let inaccessible = [...appInput.ordered_assets]
      assets.forEach(asset => (inaccessible = inaccessible.filter(item => item !== asset.uid)))
      if (inaccessible.length > 0) {
        this.throwValidationError(
          `The app assets with uids '${JSON.stringify(inaccessible)}' do not exist or are not accessible by you.`,
        )
      }
    }

    const alreadySeenInputs: string[] = []
    appInput.input_spec.forEach(spec => this.validateSpec(spec, 'input', alreadySeenInputs))
    const alreadySeenOutputs: string[] = []
    appInput.output_spec.forEach(spec => this.validateSpec(spec, 'output', alreadySeenOutputs))

    this.logger.log('App validations finished successfully')
  }

  private validateSpec(spec: AppSpecItem, type: string, alreadySeenSpec: string[]): void {
    if (!spec.name || spec.name.length === 0) {
      this.throwValidationError(`The ${type} name cannot be empty.`)
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(spec.name)) {
      this.throwValidationError(
        `The ${type} name '${spec.name}' can only contain the characters A-Z, a-z, 0-9, ` +
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
}
