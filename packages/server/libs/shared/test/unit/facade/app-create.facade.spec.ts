import { Reference } from '@mikro-orm/core'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { ENTITY_TYPE } from '@shared/domain/app/app.enum'
import { constructDxName, getCLIKeyInputSpec } from '@shared/domain/app/app.helper'
import { AppInputSpecItem } from '@shared/domain/app/app.input'
import { AppRepository } from '@shared/domain/app/app.repository'
import { SaveAppDTO } from '@shared/domain/app/dto/save-app.dto'
import { AppService } from '@shared/domain/app/services/app.service'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { AppSeriesRepository } from '@shared/domain/app-series/app-series.repository'
import { AppSeriesCountService } from '@shared/domain/app-series/app-series-count.service'
import { AppSeriesService } from '@shared/domain/app-series/service/app-series.service'
import { EVENT_TYPES, Event } from '@shared/domain/event/event.entity'
import { allowedInstanceTypes } from '@shared/domain/job/job.enum'
import { Organization } from '@shared/domain/org/organization.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { AssetRepository } from '@shared/domain/user-file/asset.repository'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { NodeService } from '@shared/domain/user-file/node.service'
import { AssetCountService } from '@shared/domain/user-file/service/asset-count.service'
import { FileCountService } from '@shared/domain/user-file/service/file-count.service'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { STATIC_SCOPE } from '@shared/enums'
import { PermissionError, ValidationError } from '@shared/errors'
import { AppCreateFacade } from '@shared/facade/app/app-create.facade'
import { PlatformClient } from '@shared/platform-client'
import { AppDescribeResponse, ClassIdResponse } from '@shared/platform-client/platform-client.responses'
import { random } from '@shared/test/generate'
import { codeRemap } from '@shared/utils/app'
import { create, db } from '../../../src/test'

// TODO (PFDA-6416): move to stubs
describe('AppCreateFacade', () => {
  const appletCreateStub = stub()
  const appCreateStub = stub()
  const containerRemoveObjectsStub = stub()
  const appDescribeStub = stub()
  const appUpdateStub = stub()
  const appAddAuthorizedUsersStub = stub()
  const appPublishStub = stub()

  let em: EntityManager<MySqlDriver>
  let userCtx: UserContext
  const platformClient = {
    appletCreate: appletCreateStub,
    appCreate: appCreateStub,
    containerRemoveObjects: containerRemoveObjectsStub,
    appDescribe: appDescribeStub,
    appUpdate: appUpdateStub,
    appAddAuthorizedUsers: appAddAuthorizedUsersStub,
    appPublish: appPublishStub,
  } as unknown as PlatformClient
  let nodeService: NodeService
  let appService: AppService
  let appSeriesService: AppSeriesService
  let appRepository: AppRepository
  let appSeriesRepository: AppSeriesRepository
  let folderRepository: FolderRepository
  let nodeRepository: NodeRepository
  let spaceRepository: SpaceRepository
  let userRepository: UserRepository
  let nodeHelper: NodeHelper
  let user: User
  let org: Organization

  const privateFilesProjectId = 'project-privateFilesProjectID'
  const appletId = 'applet-ID'
  const instanceType = 'baseline-2'
  const release = '16.04'

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    em.clear()

    appRepository = em.getRepository(App)
    appSeriesRepository = em.getRepository(AppSeries)
    folderRepository = em.getRepository(Folder)
    nodeRepository = em.getRepository(Node)
    spaceRepository = em.getRepository(Space)
    org = create.orgHelper.create(em)
    user = create.userHelper.create(em)
    user.organization = Reference.create(org)
    user.privateFilesProject = privateFilesProjectId
    await em.flush()

    userCtx = {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: 'token',
      sessionId: 'sessionId',
      loadEntity: (): Promise<User> => Promise.resolve(user),
    } as UserContext

    // Inject user context to repositories
    ;(nodeRepository as unknown as { user: UserContext }).user = userCtx
    ;(appRepository as unknown as { user: UserContext }).user = userCtx

    nodeHelper = new NodeHelper(em, userCtx, folderRepository, nodeRepository)

    nodeService = new NodeService(
      em,
      userCtx,
      // temporary creation as these services are not used in the test
      {} as unknown as UserFileService,
      {} as unknown as FolderService,
      spaceRepository,
      nodeRepository,
      userRepository,
      nodeHelper,
      {} as unknown as FileCountService,
      {} as unknown as AssetCountService,
      {} as unknown as AssetRepository,
    )

    appService = new AppService(appRepository)
    appSeriesService = new AppSeriesService(userCtx, appSeriesRepository, {} as unknown as AppSeriesCountService)

    appletCreateStub.reset()
    appletCreateStub.throws()
    appletCreateStub.resolves({
      id: appletId,
    })
    appCreateStub.reset()
    appCreateStub.throws()
    appCreateStub.resolves({
      id: `app-${random.dxstr()}`,
    })
    containerRemoveObjectsStub.reset()
    containerRemoveObjectsStub.throws()
    containerRemoveObjectsStub.resolves({ id: user.privateFilesProject })
    appDescribeStub.reset()
    appDescribeStub.throws()
    appDescribeStub.resolves({ billTo: user.billTo() } as AppDescribeResponse)
    appUpdateStub.reset()
    appUpdateStub.throws()
    appUpdateStub.resolves({} as ClassIdResponse)

    appAddAuthorizedUsersStub.reset()
    appAddAuthorizedUsersStub.throws()
    appAddAuthorizedUsersStub.resolves()

    appPublishStub.reset()
    appPublishStub.throws()
    appPublishStub.resolves()
  })

  const getDefaultApp = (): SaveAppDTO => {
    return {
      createAppSeries: true,
      createAppRevision: true,
      is_new: true,
      name: 'test-app1',
      scope: 'private',
      title: 'test-app-title',
      release: release,
      readme: ' ',
      input_spec: [],
      output_spec: [],
      ordered_assets: [],
      packages: ['2ping'],
      code: '',
      internet_access: false,
      instance_type: instanceType,
      entity_type: 'whatever',
    }
  }

  context('create', () => {
    it('test call orchestration', async () => {
      userContextStorage.run(userCtx, () => {})

      const appCreateFacade = getInstance()

      const appInput: SaveAppDTO = getDefaultApp()
      const resultId = await appCreateFacade.create(appInput)

      // validate createOrGetAppSeries
      const loadedAppSeries = await em.findOneOrFail(AppSeries, { name: appInput.name })
      expect(loadedAppSeries.user?.id).to.equal(user.id)
      expect(loadedAppSeries.dxid).to.contain('app-user')
      expect(loadedAppSeries.dxid).to.contain(appInput.name)
      expect(loadedAppSeries.scope).to.equal(STATIC_SCOPE.PRIVATE.toString())

      // validate createApplet
      expect(appletCreateStub.calledOnce).to.be.true()
      expect(appletCreateStub.firstCall.args[0].project).to.equal(privateFilesProjectId)
      expect(appletCreateStub.firstCall.args[0].inputSpec).to.deep.equal(appInput.input_spec)
      expect(appletCreateStub.firstCall.args[0].outputSpec).to.deep.equal(appInput.output_spec)
      const runSpec = appletCreateStub.firstCall.args[0].runSpec
      expect(runSpec.code).to.equal(codeRemap(appInput.code, appInput.internet_access))
      expect(runSpec.interpreter).to.equal('bash')
      expect(runSpec.systemRequirements.toString()).to.equal(
        { '*': { instanceType: allowedInstanceTypes[appInput.instance_type] } }.toString(),
      )
      expect(runSpec.distribution).to.equal('Ubuntu')
      expect(runSpec.release).to.equal(release)
      expect(runSpec.execDepends.length).to.equal(1)
      expect(runSpec.execDepends[0].name).to.equal('2ping')
      expect(appletCreateStub.firstCall.args[0].dxapi).to.equal('1.0.0')
      // validate createAppInPlatform

      expect(appCreateStub.calledOnce).to.be.true()
      expect(appCreateStub.firstCall.args[0].applet).to.equal(appletId)
      expect(appCreateStub.firstCall.args[0].name).to.equal(constructDxName(user.dxuser, appInput.name, appInput.scope))
      expect(appCreateStub.firstCall.args[0].title).to.equal(appInput.title)
      expect(appCreateStub.firstCall.args[0].summary).to.equal(' ')
      expect(appCreateStub.firstCall.args[0].description).to.equal(' ')
      expect(appCreateStub.firstCall.args[0].version.startsWith('r')).to.equal(true)
      expect(appCreateStub.firstCall.args[0].resources).to.be.empty()
      expect(appCreateStub.firstCall.args[0].details.ordered_assets).to.be.empty()
      expect(appCreateStub.firstCall.args[0].openSource).to.be.false()
      expect(appCreateStub.firstCall.args[0].billTo).to.equal(user.organization.getEntity().getDxOrg())
      expect(JSON.stringify(appCreateStub.firstCall.args[0].access)).to.equal(JSON.stringify({}))

      // validate containerRemoveObjects
      expect(containerRemoveObjectsStub.calledOnce).to.be.true()
      expect(containerRemoveObjectsStub.firstCall.args[0]).to.equal(privateFilesProjectId)
      expect(containerRemoveObjectsStub.firstCall.args[1]).to.deep.equal([appletId])

      // validate saveAppInDB
      const loadedApp = await em.findOneOrFail(App, { uid: resultId }, { populate: ['assets'] })
      expect(loadedApp.dxid).to.equal(resultId.substring(0, resultId.lastIndexOf('-')))
      expect(loadedApp.revision).to.equal(1)
      expect(loadedApp.title).to.equal(appInput.title)
      expect(loadedApp.readme).to.equal(' ')
      expect(loadedApp.entityType).to.equal(ENTITY_TYPE.NORMAL)
      expect(loadedApp.scope).to.equal(STATIC_SCOPE.PRIVATE.toString())
      expect(loadedApp.forkedFrom).to.be.null()
      expect(loadedApp.spec.input_spec.length).to.equal(0)
      expect(loadedApp.spec.output_spec.length).to.equal(0)
      expect(loadedApp.spec.internet_access).to.equal(false)
      expect(loadedApp.spec.instance_type).to.equal(instanceType)
      expect(loadedApp.internal.packages?.length).to.equal(1)
      expect(loadedApp.internal.code).to.equal(appInput.code)
      expect(loadedApp.assets.length).to.equal(0)
      expect(loadedApp.release).to.equal(release)

      // validate updateAppSeries
      expect(loadedAppSeries.latestRevisionAppId).to.equal(loadedApp.id)

      // validate createAppEvent
      const loadedAppEvent = await em.findOneOrFail(Event, { param1: loadedApp.dxid })
      expect(loadedAppEvent.type).to.equal(EVENT_TYPES.APP_CREATED)
      expect(loadedAppEvent.orgHandle).not.to.be.null()
      expect(loadedAppEvent.dxuser).not.to.be.null()
      expect(loadedAppEvent.param1).to.equal(loadedApp.dxid)
      expect(loadedAppEvent.param2).to.equal(appInput.title)

      expect(resultId).to.deep.equal(`${loadedApp.dxid}-1`)
    })

    it('test call app series validation', async () => {
      const appCreateFacade = getInstance()

      const appInput = getDefaultApp()
      appInput.createAppSeries = false
      appInput.createAppRevision = true

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        'This would create a new app series and client did not request its creation.',
      )
    })

    it('test call app revision validation', async () => {
      const appInput = getDefaultApp()
      const app = create.appHelper.createRegular(em, { user }, { title: 'temporary' })
      await em.flush()
      create.appSeriesHelper.create(
        em,
        { user },
        {
          name: appInput.name,
          scope: 'private',
          latestRevisionAppId: app.id,
        },
      )
      await em.flush()

      const appCreateFacade = getInstance()

      appInput.createAppSeries = false
      appInput.createAppRevision = false

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        'This would create a new app revision and client did not request its creation.',
      )
    })

    it('test create public app with non site admin user', async () => {
      const appInput = getDefaultApp()
      appInput.scope = 'public'
      create.appSeriesHelper.create(em, { user }, { name: appInput.name, scope: 'public' })

      const nonAdminUser = create.userHelper.create(em)
      await em.flush()
      const nonAdminUserCtx = {
        id: nonAdminUser.id,
        dxuser: nonAdminUser.dxuser,
        loadEntity: async () => nonAdminUser,
      } as UserContext

      const appCreateFacade = getInstance(nonAdminUserCtx)

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        PermissionError,
        'Only site admins can create public apps.',
      )
    })

    it('with assets', async () => {
      const asset1 = create.assetHelper.create(em, { user }, { name: 'asset-1' })
      const asset2 = create.assetHelper.create(em, { user }, { name: 'asset-2' })
      await em.flush()

      const appCreateFacade = getInstance()

      const appInput = getDefaultApp()
      appInput.entity_type = 'https'
      appInput.internet_access = true
      appInput.ordered_assets = [asset1.uid, asset2.uid]

      const resultId = await appCreateFacade.create(appInput)

      const loadedApp = await em.findOneOrFail(App, { uid: resultId }, { populate: ['assets'] })
      expect(loadedApp.spec.internet_access).to.equal(true)
      expect(loadedApp.isHTTPS()).to.be.true()
      expect(loadedApp.assets.length).to.equal(2)
      expect([asset1.uid, asset2.uid].includes(loadedApp.assets[0].uid)).to.be.true()
      expect([asset1.uid, asset2.uid].includes(loadedApp.assets[1].uid)).to.be.true()
      expect(loadedApp.internal.ordered_assets?.length).to.equal(2)
      expect(loadedApp.internal.ordered_assets).to.contain.members([asset1.uid, asset2.uid])
    })

    it('new revision of an app', async () => {
      const appCreateFacade = getInstance()

      const appInput1 = getDefaultApp()
      const appInput2 = getDefaultApp()
      appInput2.is_new = false

      const result1 = await appCreateFacade.create(appInput1)
      const result2 = await appCreateFacade.create(appInput2)
      em.clear()

      expect(result1).to.not.equal(result2)

      const appSeries = await em.findOneOrFail(AppSeries, { name: appInput1.name })
      expect(appSeries.latestRevisionAppId).to.equal(2)
      const apps = await em.find(App, { uid: [result1, result2] })
      expect(apps.length).to.equal(2)
      const firstApp = apps.find(app => app.id === 1)
      expect(firstApp?.revision).to.equal(1)
      expect(firstApp?.uid).to.equal(result1)
      const secondApp = apps.find(app => app.id === 2)
      expect(secondApp?.revision).to.equal(2)
      expect(secondApp?.uid).to.equal(result2)
    })

    // TODO test validateAppRevisionCreation

    it('complex inputs and outputs', async () => {
      const appCreateFacade = getInstance()

      const appInput1 = getDefaultApp()

      const intSpec = getSpec('intName', 'int', 'intHelp', 'intLabel', false, 0, [])
      const floatSpec = getSpec('floatName', 'float', 'floatHelp', 'floatLabel', false, 0, [])
      const stringSpec = getSpec('stringName', 'string', 'stringHelp', 'stringLabel', false, undefined, [])
      const booleanSpec = getSpec('booleanName', 'boolean', 'booleanHelp', 'booleanLabel', false, false, [])
      const fileSpec = getSpec('fileName', 'file', 'fileHelp', 'fileLabel', false, undefined, [])
      const arraySpec = getSpec('arrayName', 'array:string', 'arrayHelp', 'arrayLabel', false, undefined, [])

      appInput1.input_spec = [intSpec, floatSpec, stringSpec, booleanSpec, fileSpec, arraySpec]
      appInput1.output_spec = [intSpec, floatSpec, stringSpec, booleanSpec, fileSpec, arraySpec]

      const result = await appCreateFacade.create(appInput1)
      em.clear()

      const loadedApp = await em.findOneOrFail(App, { uid: result })
      expect(JSON.stringify(loadedApp.spec.input_spec[0])).to.equal(JSON.stringify(intSpec))
      expect(JSON.stringify(loadedApp.spec.input_spec[1])).to.equal(JSON.stringify(floatSpec))
      expect(JSON.stringify(loadedApp.spec.input_spec[2])).to.equal(JSON.stringify(stringSpec))
      expect(JSON.stringify(loadedApp.spec.input_spec[3])).to.equal(JSON.stringify(booleanSpec))
      expect(JSON.stringify(loadedApp.spec.input_spec[4])).to.equal(JSON.stringify(fileSpec))
      expect(JSON.stringify(loadedApp.spec.input_spec[5])).to.equal(JSON.stringify(arraySpec))

      expect(JSON.stringify(loadedApp.spec.output_spec[0])).to.equal(JSON.stringify(intSpec))
      expect(JSON.stringify(loadedApp.spec.output_spec[1])).to.equal(JSON.stringify(floatSpec))
      expect(JSON.stringify(loadedApp.spec.output_spec[2])).to.equal(JSON.stringify(stringSpec))
      expect(JSON.stringify(loadedApp.spec.output_spec[3])).to.equal(JSON.stringify(booleanSpec))
      expect(JSON.stringify(loadedApp.spec.output_spec[4])).to.equal(JSON.stringify(fileSpec))
      expect(JSON.stringify(loadedApp.spec.output_spec[5])).to.equal(JSON.stringify(arraySpec))
    })

    it("don't send default and choices to createApplet", async () => {
      const appCreateFacade = getInstance()

      const appInput1 = getDefaultApp()
      const intSpec = getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [1, 2, 3])
      appInput1.input_spec = [intSpec]

      await appCreateFacade.create(appInput1)

      expect(appletCreateStub.calledOnce).to.be.true()
      expect(appletCreateStub.firstCall.args[0].inputSpec[0]).not.to.have.property('default')
      expect(appletCreateStub.firstCall.args[0].inputSpec[0]).not.to.have.property('choices')
    })

    it('strip empty choices from input and output spec', async () => {
      const appCreateFacade = getInstance()

      const appInput = getDefaultApp()
      appInput.input_spec = [getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [])]
      appInput.output_spec = [getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [])]

      const appUid = await appCreateFacade.create(appInput)

      const loadedApp = await em.findOneOrFail(App, { uid: appUid })

      expect(loadedApp.spec.input_spec[0]).not.to.have.property('choices')
      expect(loadedApp.spec.output_spec[0]).not.to.have.property('choices')
    })

    it('preserve choices in input and output spec', async () => {
      const appCreateFacade = getInstance()

      const appInput = getDefaultApp()
      appInput.input_spec = [getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [1, 2])]
      appInput.output_spec = [getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [3, 4])]

      const appUid = await appCreateFacade.create(appInput)

      const loadedApp = await em.findOneOrFail(App, { uid: appUid })

      expect(loadedApp.spec.input_spec[0].choices).to.deep.equal([1, 2])
    })

    it('validate release', async () => {
      const appCreateFacade = getInstance()
      const appInput = getDefaultApp()

      appInput.release = 'nonsense'

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        'Unacceptable release nonsense',
      )
    })

    const createAppWithNameAndFail = async (name: string, appCreateFacade: AppCreateFacade): Promise<void> => {
      const appInput = getDefaultApp()
      appInput.name = name

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        "The app 'name' can only contain the characters A-Z, a-z, 0-9, " +
          "'.' (period), '_' (underscore) and '-' (dash).",
      )
    }

    const createAppWithNameAndSucceed = async (name: string, appCreateFacade: AppCreateFacade): Promise<void> => {
      appCreateStub.resolves({
        id: `app-${random.dxstr()}`,
      })
      const appInput = getDefaultApp()
      appInput.name = name

      const result = await appCreateFacade.create(appInput)
      expect(result).not.to.be.null()
    }

    it('validate appName', async () => {
      const appCreateFacade = getInstance()

      // all will fail
      await createAppWithNameAndFail('žýá', appCreateFacade)
      await createAppWithNameAndFail('#appp', appCreateFacade)
      await createAppWithNameAndFail('with space', appCreateFacade)
      await createAppWithNameAndFail('weirdChars()', appCreateFacade)

      // all will succeed
      await createAppWithNameAndSucceed('App', appCreateFacade)
      await createAppWithNameAndSucceed('App01.1', appCreateFacade)
      await createAppWithNameAndSucceed('app_0_1-yes', appCreateFacade)
    })

    it('validate instance', async () => {
      const appCreateFacade = getInstance()
      const appInput = getDefaultApp()

      appInput.instance_type = 'nonsense'

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        `The app 'instance type' must be one of: ${Object.keys(allowedInstanceTypes)}`,
      )
    })

    it('validate package', async () => {
      const appCreateFacade = getInstance()
      const appInput = getDefaultApp()

      appInput.packages = ['nonsense']

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        "The package 'nonsense' is not a valid Ubuntu package.",
      )
    })

    it('validate assets', async () => {
      const appCreateFacade = getInstance()
      const appInput = getDefaultApp()
      const asset1 = create.assetHelper.create(em, { user }, { name: 'asset-1' })
      await em.flush()

      appInput.ordered_assets = [asset1.uid, 'file-non.existing-1']

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        'The app assets with uids \'["file-non.existing-1"]\' do not exist or are not accessible by you.',
      )
    })

    it('validate inputs and outputs', async () => {
      const appCreateFacade = getInstance()
      const appInput = getDefaultApp()
      const intSpec = getSpec('', 'int', 'intHelp', 'intLabel', false, 1, [1, 2, 3])
      appInput.input_spec = [intSpec]

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        'The input name cannot be empty.',
      )

      // incorrect name
      intSpec.name = 'na me'

      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        `The input name 'na me' can only contain the characters A-Z, a-z, 0-9, ` +
          "'.' (period), '_' (underscore) and '-' (dash).",
      )

      // duplicate
      intSpec.name = 'name'
      appInput.input_spec = [intSpec, intSpec]
      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        `Duplicate definitions for input named ${intSpec.name}.`,
      )

      // missing class
      intSpec.class = '' as AppInputSpecItem['class']
      appInput.input_spec = [intSpec]
      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        `The input named ${intSpec.name} is missing type.`,
      )

      // invalid class
      intSpec.class = 'object' as AppInputSpecItem['class']
      await expect(appCreateFacade.create(appInput)).to.be.rejectedWith(
        ValidationError,
        `The input named ${intSpec.name} contains invalid type.`,
      )
    })

    it('array as inputs and outputs', async () => {
      const appCreateFacade = getInstance()
      const appInput = getDefaultApp()

      const fileSpec = getSpec('file_array', 'array:file', '', 'inputArray', false, [], [1, 2, 3])
      appInput.input_spec = [fileSpec]
      const stringSpec = getSpec('string_array', 'array:string', '', 'outputArray', false, [], [])
      appInput.output_spec = [stringSpec]

      const result = await appCreateFacade.create(appInput)
      em.clear()

      const loadedApp = await em.findOneOrFail(App, { uid: result })
      expect(loadedApp.spec.input_spec[0].class).to.equal('array:file')
      expect(loadedApp.spec.output_spec[0].class).to.equal('array:string')
    })

    it('create a new revision for app with different billTo', async () => {
      const previousBillTo = 'previousBillTo'
      appDescribeStub.resolves({ billTo: previousBillTo } as AppDescribeResponse)
      // create a first app so that we have app series
      const appCreateFacade = getInstance()

      const appInput1 = getDefaultApp()
      await appCreateFacade.create(appInput1) // we don't care about the result

      const appInput = getDefaultApp()

      const result = await appCreateFacade.create(appInput)

      const loadedApp = await em.findOneOrFail(App, { uid: result })
      expect(loadedApp).not.to.be.null()
      // this should be set to current user
      expect(appDescribeStub.calledOnce).to.be.true()
      expect(appCreateStub.calledTwice).to.be.true()
      expect(appCreateStub.secondCall.args[0].billTo).to.eq(previousBillTo)
      // for the update we need current users bill to
      expect(appUpdateStub.calledOnce).to.be.true()
      expect(appUpdateStub.firstCall.args[1].billTo).to.eq(user.billTo())
    })

    it('create app with CLI setup input if internet access is enabled', async () => {
      const appCreateFacade = getInstance()

      const appInput = getDefaultApp()
      appInput.internet_access = true
      const resultId = await appCreateFacade.create(appInput)

      const loadedApp = await em.findOneOrFail(App, { uid: resultId })
      expect(loadedApp.spec.internet_access).to.equal(true)
      expect(appletCreateStub.calledOnce).to.be.true()
      expect(appletCreateStub.firstCall.args[0].project).to.equal(privateFilesProjectId)
      expect(appletCreateStub.firstCall.args[0].inputSpec).to.deep.equal(getCLIKeyInputSpec())
      expect(appletCreateStub.firstCall.args[0].outputSpec).to.deep.equal(appInput.output_spec)
    })

    it('create app and publish it to orgs if scope is space scope', async () => {
      const space = create.spacesHelper.create(em, { type: SPACE_TYPE.GROUPS })
      create.spacesHelper.addMember(
        em,
        { space, user },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()

      const appInput = getDefaultApp()
      appInput.scope = `space-${space.id}`

      const appCreateFacade = getInstance()
      const resultId = await appCreateFacade.create(appInput)

      const loadedApp = await em.findOneOrFail(App, { uid: resultId })
      expect(loadedApp.scope).to.equal(`space-${space.id}`)
      expect(appAddAuthorizedUsersStub.calledOnce).to.be.true()
      expect(appAddAuthorizedUsersStub.firstCall.args[0]).to.deep.equal({
        appId: loadedApp.dxid,
        authorizedUsers: [space.hostDxOrg, space.guestDxOrg],
      })
      expect(appPublishStub.calledOnce).to.be.true()
      expect(appPublishStub.firstCall.args[0]).to.deep.equal({
        appId: loadedApp.dxid,
        makeDefault: false,
      })
    })
  })

  function getSpec(
    name: string,
    classValue: string,
    help: string,
    label: string,
    optional: boolean,
    defaultValue: AppInputSpecItem['default'],
    choices: unknown[],
  ): AppInputSpecItem {
    return {
      name,
      class: classValue as AppInputSpecItem['class'],
      help,
      label,
      optional,
      default: defaultValue,
      choices,
    }
  }

  function getInstance(userContext: UserContext = userCtx): AppCreateFacade {
    return new AppCreateFacade(em, userContext, platformClient, nodeService, appService, appSeriesService)
  }
})
