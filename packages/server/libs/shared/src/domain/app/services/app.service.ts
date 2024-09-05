import { SqlEntityManager } from '@mikro-orm/mysql'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { User } from '@shared/domain/user/user.entity'
import { ValidationError } from '@shared/errors'
import * as crypto from 'crypto'
import { UBUNTU_20, UBUNTU_RELEASES, VALID_IO_CLASSES } from '../../../config/consts'
import { validUbuntuPackages } from '../../../config/ubuntu_packages'
import { STATIC_SCOPE } from '../../../enums'
import { getLogger } from '../../../logger'
import { PlatformClient } from '../../../platform-client'
import {
  AppCreateParams,
  AppletCreateParams,
  PackageMapping,
} from '../../../platform-client/platform-client.params'
import { codeRemap } from '../../../utils/app'
import { createAppCreated } from '../../event/event.helper'
import { allowedInstanceTypes } from '../../job/job.enum'
import { AssetRepository } from '../../user-file/asset.repository'
import { App, AppSpec, Internal } from '../app.entity'
import { ENTITY_TYPE } from '../app.enum'
import { constructDxid, constructDxname } from '../app.helper'
import { AppInput, PlatformSpec, Spec } from '../app.input'

const logger = getLogger('app.service')

export interface IAppService {
  create: (appInput: AppInput, userId: number) => Promise<string>
}

export class AppService implements IAppService {
  private platformClient: PlatformClient
  private em: SqlEntityManager
  private assetRepository: AssetRepository

  constructor(em: SqlEntityManager, platformClient: PlatformClient) {
    this.em = em
    this.platformClient = platformClient
    this.assetRepository = em.getRepository(Asset)
  }

  private validateSpec(spec: Spec, type: string, alreadySeenSpec: string[]) {
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

  private throwValidationError(message: string) {
    logger.error(message)
    throw new ValidationError(message)
  }

  private async validateAppInput(appInput: AppInput, userId: number) {
    logger.log('Starting app validations')

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
      const assets = await this.getAssets(userId, appInput.ordered_assets)
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

    logger.log('App validations finished successfully')
  }

  private getScope = (scope?: string) => {
    if (
      scope &&
      [STATIC_SCOPE.PUBLIC.toString(), STATIC_SCOPE.PRIVATE.toString(), null].includes(scope)
    ) {
      return STATIC_SCOPE.PRIVATE.toString()
    } else {
      return scope
    }
  }

  private getAssetDxids = (assets: Asset[]): string[] => {
    if (assets.length === 1) {
      return [assets[0].dxid]
    } else {
      return assets.map((asset) => asset.dxid)
    }
  }

  private getEntityType = (entityType: string) => {
    if (entityType && entityType === 'https') {
      return ENTITY_TYPE.HTTPS
    } else {
      return ENTITY_TYPE.NORMAL
    }
  }

  private getAssets = async (userId: number, orderedAssets: Uid<'file'>[]): Promise<Asset[]> => {
    if (orderedAssets) {
      return await this.assetRepository.findAccessibleByUser(userId, orderedAssets)
    } else {
      return []
    }
  }

  private createOrGetAppSeries = async (
    user: User,
    appName: string,
    scope?: string,
  ): Promise<AppSeries> => {
    const appSeriesDxid = constructDxid(user.dxuser, appName, scope)
    let appSeries: AppSeries | null = await this.em.findOne(AppSeries, { dxid: appSeriesDxid })
    if (!appSeries) {
      appSeries = new AppSeries(user)
      appSeries.name = appName
      appSeries.dxid = appSeriesDxid
      appSeries.scope = scope
      logger.log(`Creating app series ${appSeries.dxid}`)
      await this.em.persistAndFlush(appSeries)
    }
    return appSeries
  }

  private getAppRevision = async (latestRevisionAppId?: number) => {
    const latestRevisionApp = await this.em.findOne(App, { id: latestRevisionAppId })
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
  private createApplet = async (
    user: User,
    appInput: AppInput,
    release: string,
  ): Promise<string> => {
    logger.log('Creating applet in platform')
    const appletCreateParams: AppletCreateParams = {
      project: user.privateFilesProject,
      inputSpec: this.remapPfdaSpecToPlatformSpec(appInput.input_spec),
      outputSpec: this.remapPfdaSpecToPlatformSpec(appInput.output_spec),
      runSpec: {
        code: codeRemap(appInput.code),
        interpreter: 'bash',
        systemRequirements: {
          // @ts-ignore
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
    logger.log(`Applet with id ${appletCreateResponse.id} created successfully`)
    return appletCreateResponse.id
  }

  private createAppInPlatform = async (
    appletId: string,
    appInput: AppInput,
    revision: number,
    user: User,
    assets: Asset[],
  ): Promise<DxId<'app'>> => {
    logger.log(`Creating app in platform for applet id ${appletId}`)
    const assetDxids = this.getAssetDxids(assets)
    const appCreateParams: AppCreateParams = {
      applet: appletId,
      name: constructDxname(user.dxuser, appInput.name, appInput.scope),
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
    logger.log(`App with id ${appCreateResponse.id} for applet id ${appletId} created successfully`)
    return appCreateResponse.id
  }

  private createAppEvent = async (user: User, app: App) => {
    logger.log(`Creating app event for app ${app.uid} and user ${user.id}`)
    const createAppEvent = await createAppCreated(user, app)
    await this.em.persistAndFlush(createAppEvent)
  }

  private updateAppSeries = async (appSeries: AppSeries, appInput: AppInput, app: App) => {
    logger.log(`Updating app series ${appSeries.dxid}`)
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

  private saveAppInDB = async (
    user: User,
    platformAppId: DxId<'app'>,
    revision: number,
    release: string,
    assets: Asset[],
    appInput: AppInput,
    appSeriesId: number,
  ) => {
    logger.log(`Saving app in DB with platformAppId: ${platformAppId}`)
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
   * @param userId id of the calling user
   * @return uid of newly created app
   */
  create = async (appInput: AppInput, userId: number): Promise<string> => {
    logger.log(`Creating app for userId: ${userId}`)
    await this.validateAppInput(appInput, userId)
    await this.em.begin()
    try {
      const user = await this.em.findOneOrFail(User, { id: userId }, { populate: ['organization'] })
      const scope = this.getScope(appInput.scope)
      const assets = await this.getAssets(
        userId,
        appInput.ordered_assets ? appInput.ordered_assets : [],
      )

      // - create app series
      const appSeries = await this.createOrGetAppSeries(user, appInput.name, scope)

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
        await this.platformClient.containerRemoveObjects(user.privateFilesProject, {
          objects: [appletId],
        })
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
      logger.error('AppService: error creating an app', error)
      await this.em.rollback()
      throw error
    }
  }
}
