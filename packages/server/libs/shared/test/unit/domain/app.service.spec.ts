import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { App } from '@shared/domain/app/app.entity'
import { AppService } from '@shared/domain/app/services/app.service'
import { User } from '@shared/domain/user/user.entity'
import { Event } from '@shared/domain/event/event.entity'
import { ClassIdResponse } from '@shared/platform-client/platform-client.responses'
import { create, db } from '../../../src/test'
import { PlatformClient } from '@shared/platform-client'
import {
  AppCreateParams,
  AppletCreateParams,
  ObjectsParams,
} from '../../../src/platform-client/platform-client.params'
import { AppInput, Spec } from '../../../src/domain/app/app.input'
import { expect } from 'chai'
import { STATIC_SCOPE } from '../../../src/enums'
import { allowedInstanceTypes } from '../../../src/domain/job/job.enum'
import { constructDxname } from '../../../src/domain/app/app.helper'
import { ENTITY_TYPE } from '../../../src/domain/app/app.enum'
import { EVENT_TYPES } from '../../../src/domain/event/event.helper'
import { codeRemap } from '../../../src/utils/app'

describe('app service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let platformClient: PlatformClient

  let appletCreateParams: AppletCreateParams
  let appCreateParams: AppCreateParams
  let removeObjectsContainerParam: string
  let removeObjectsParam: any

  const privateFilesProjectId = 'privateFilesProjectID'
  const appletId = 'applet-ID'
  let appId = 'app-ID'
  const instanceType = 'baseline-2'
  const release = '16.04'

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    user.privateFilesProject = privateFilesProjectId
    await em.flush()

    platformClient = {
      async appletCreate(params: AppletCreateParams): Promise<ClassIdResponse> {
        appletCreateParams = params
        return { id: appletId }
      },
      async appCreate(params: AppCreateParams): Promise<ClassIdResponse> {
        appCreateParams = params
        return { id: appId }
      },
      async containerRemoveObjects(containerId: string, params: ObjectsParams): Promise<ClassIdResponse> {
        removeObjectsContainerParam = containerId
        removeObjectsParam = params
        return { id: containerId }
      },
    } as PlatformClient
  })

  const getDefaultApp = (): AppInput => {
    return {
      is_new: true,
      name: 'test-app1',
      scope: 'private',
      title: 'test-app-title',
      release: release,
      readme: " ",
      input_spec: [],
      output_spec: [],
      ordered_assets: [],
      packages: ["2ping"],
      code: "",
      internet_access: false,
      instance_type: instanceType,
      entity_type: 'whatever'
    }
  }

  it('save app - test call orchestration', async () => {
    const appService = new AppService(em, platformClient)

    const appInput: AppInput = getDefaultApp()
    const resultId = await appService.create(appInput, user.id)
    em.clear()

    // validate createOrGetAppSeries
    const loadedAppSeries = await em.findOneOrFail(AppSeries, {name: appInput.name})
    expect(loadedAppSeries.user?.id).to.equal(user.id)
    expect(loadedAppSeries.dxid).to.contain('app-user')
    expect(loadedAppSeries.dxid).to.contain(appInput.name)
    expect(loadedAppSeries.scope).to.equal(STATIC_SCOPE.PRIVATE.toString())

    // validate createApplet
    expect(appletCreateParams.project).to.equal(privateFilesProjectId)
    expect(JSON.stringify(appletCreateParams.inputSpec)).to.equal(JSON.stringify(appInput.input_spec))
    expect(JSON.stringify(appletCreateParams.outputSpec)).to.equal(JSON.stringify(appInput.output_spec))
    const runSpec = appletCreateParams.runSpec
    expect(runSpec.code).to.equal(codeRemap(appInput.code))
    expect(runSpec.interpreter).to.equal('bash')
    expect(runSpec.systemRequirements.toString()).to.equal({'*': { instanceType: allowedInstanceTypes[appInput.instance_type] }}.toString())
    expect(runSpec.distribution).to.equal('Ubuntu')
    expect(runSpec.release).to.equal(release)
    expect(runSpec.execDepends.length).to.equal(1)
    expect(runSpec.execDepends[0].name).to.equal('2ping')
    expect(appletCreateParams.dxapi).to.equal('1.0.0')
    // validate createAppInPlatform
    expect(appCreateParams.applet).to.equal(appletId)
    expect(appCreateParams.name).to.equal(constructDxname(user.dxuser, appInput.name, appInput.scope))
    expect(appCreateParams.title).to.equal(appInput.title)
    expect(appCreateParams.summary).to.equal(' ')
    expect(appCreateParams.description).to.equal(' ')
    expect(appCreateParams.version.startsWith('r')).to.equal(true)
    expect(appCreateParams.resources).to.be.empty()
    expect(appCreateParams.details.ordered_assets).to.be.empty()
    expect(appCreateParams.openSource).to.be.false()
    expect(appCreateParams.billTo).to.equal(user.organization.getEntity().getDxOrg())
    expect(JSON.stringify(appCreateParams.access)).to.equal(JSON.stringify({}))

    // validate containerRemoveObjects
    expect(removeObjectsContainerParam).to.equal(privateFilesProjectId)
    expect(JSON.stringify(removeObjectsParam)).to.equal(JSON.stringify({objects: [appletId]}))

    // validate saveAppInDB
    const loadedApp = await em.findOneOrFail(App, {dxid: appId}, {populate: ['assets']})
    expect(loadedApp.dxid).to.equal(appId)
    expect(loadedApp.uid).to.equal(`${appId}-1`)
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
    const loadedAppEvent = await em.findOneOrFail(Event, {param1: appId})
    expect(loadedAppEvent.type).to.equal(EVENT_TYPES.APP_CREATED.toString())
    expect(loadedAppEvent.orgHandle).not.to.be.null()
    expect(loadedAppEvent.dxuser).not.to.be.null()
    expect(loadedAppEvent.param1).to.equal(appId)
    expect(loadedAppEvent.param2).to.equal(appInput.title)

    expect(resultId).to.equal(`${appId}-1`)
  })

  it('save app - with assets', async() => {
    const asset1 = create.assetHelper.create(em, {user}, {name: "asset-1"})
    const asset2 = create.assetHelper.create(em, {user}, {name: "asset-2"})

    const appService = new AppService(em, platformClient)

    const appInput: AppInput = getDefaultApp()
    appInput.entity_type = 'https'
    appInput.internet_access = true
    appInput.ordered_assets = [asset1.uid, asset2.uid]

    await appService.create(appInput, user.id)
    em.clear()

    const loadedApp = await em.findOneOrFail(App, {dxid: appId}, {populate: ['assets']})
    expect(loadedApp.spec.internet_access).to.equal(true)
    expect(loadedApp.isHTTPS()).to.be.true()
    expect(loadedApp.assets.length).to.equal(2)
    expect(loadedApp.assets[0].uid).to.equal(asset1.uid)
    expect(loadedApp.assets[1].uid).to.equal(asset2.uid)
    expect(loadedApp.internal.ordered_assets?.length).to.equal(2)
    expect(loadedApp.internal.ordered_assets?.[0]).to.equal(asset1.uid)
    expect(loadedApp.internal.ordered_assets?.[1]).to.equal(asset2.uid)
  })

  it('save app - new revision of an app', async () => {
    const appService = new AppService(em, platformClient)
    const appInput1: AppInput = getDefaultApp()
    const appInput2: AppInput = getDefaultApp()
    appInput2.is_new = false

    const result1 = await appService.create(appInput1, user.id)
    const result2 = await appService.create(appInput2, user.id)
    em.clear()

    expect(result1).to.not.equal(result2)

    const appSeries = await em.findOneOrFail(AppSeries, {name: appInput1.name})
    expect(appSeries.latestRevisionAppId).to.equal(2)
    const apps = await em.find(App, {dxid: appId})
    expect(apps.length).to.equal(2)
    const firstApp = apps.find(app => app.id === 1)
    expect(firstApp?.revision).to.equal(1)
    expect(firstApp?.uid).to.equal(`${appId}-1`)
    const secondApp = apps.find(app => app.id === 2)
    expect(secondApp?.revision).to.equal(2)
    expect(secondApp?.uid).to.equal(`${appId}-2`)
  })

  const getSpec = (name: string, classValue: string, help: string, label: string,
    optional: boolean, defaultValue: any, choices: any[]): Spec => {
    return {
      name,
      class: classValue,
      help, label, optional,
      default: defaultValue,
      choices
    }
  }

  it('save app - complex inputs and outputs', async() => {
    const appService = new AppService(em, platformClient)
    const appInput1: AppInput = getDefaultApp()

    const intSpec = getSpec('intName', 'int', 'intHelp', 'intLabel', false, 0, [])
    const floatSpec = getSpec('floatName', 'float', 'floatHelp', 'floatLabel', false, 0, [])
    const stringSpec = getSpec('stringName', 'string', 'stringHelp', 'stringLabel', false, undefined, [])
    const booleanSpec = getSpec('booleanName', 'boolean', 'booleanHelp', 'booleanLabel', false, false, [])
    const fileSpec = getSpec('fileName', 'file', 'fileHelp', 'fileLabel', false, undefined, [])
    const arraySpec = getSpec('arrayName', 'array:string', 'arrayHelp', 'arrayLabel', false, undefined, [])

    appInput1.input_spec = [intSpec, floatSpec, stringSpec, booleanSpec, fileSpec, arraySpec]
    appInput1.output_spec = [intSpec, floatSpec, stringSpec, booleanSpec, fileSpec, arraySpec]

    const result = await appService.create(appInput1, user.id)
    em.clear()

    const loadedApp = await em.findOneOrFail(App, {uid: result})
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

  it("save app - don't send default and choices to createApplet", async () => {
    const appService = new AppService(em, platformClient)
    const appInput1: AppInput = getDefaultApp()
    const intSpec = getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [1, 2, 3])
    appInput1.input_spec = [intSpec]

    await appService.create(appInput1, user.id)

    expect(appletCreateParams.inputSpec[0]).not.to.have.property('default')
    expect(appletCreateParams.inputSpec[0]).not.to.have.property('choices')
  })

  it('save app - strip empty choices from input and output spec', async() => {
    const appService = new AppService(em, platformClient)
    const appInput: AppInput = getDefaultApp()
    appInput.input_spec = [getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [])]
    appInput.output_spec = [getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [])]

    const appUid = await appService.create(appInput, user.id)

    const loadedApp = await em.findOneOrFail(App, {uid: appUid})

    expect(loadedApp.spec.input_spec[0]).not.to.have.property('choices')
    expect(loadedApp.spec.output_spec[0]).not.to.have.property('choices')
  })

  it('save app - preserve choices in input and output spec', async() => {
    const appService = new AppService(em, platformClient)
    const appInput: AppInput = getDefaultApp()
    appInput.input_spec = [getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [1, 2])]
    appInput.output_spec = [getSpec('intName', 'int', 'intHelp', 'intLabel', false, 1, [3, 4])]

    const appUid = await appService.create(appInput, user.id)

    const loadedApp = await em.findOneOrFail(App, {uid: appUid})

    expect(loadedApp.spec.input_spec[0].choices).to.deep.equal([1, 2])
    expect(loadedApp.spec.output_spec[0].choices).to.deep.equal([3, 4])
  })

  it('save app - validate release', async() => {
    const appService = new AppService(em, platformClient)
    const appInput: AppInput = getDefaultApp()

    appInput.release = 'nonsense'

    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal('Unacceptable release nonsense')
    }
  })

  const createAppWithNameAndFail = async (name: string, appService: AppService) => {
    const appInput: AppInput = getDefaultApp()
    appInput.name = name

    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal('The app \'name\' can only contain the characters A-Z, a-z, 0-9, ' +
        '\'.\' (period), \'_\' (underscore) and \'-\' (dash).')
    }
  }

  const createAppWithNameAndSucceed = async (name: string, appService: AppService) => {
    const appInput: AppInput = getDefaultApp()
    appInput.name = name
    appId = name // just to make it unique

    const result = await appService.create(appInput, user.id)
    expect(result).not.to.be.null()
  }

  it('save app - validate appName', async() => {
    const appService = new AppService(em, platformClient)

    // all will fail
    await createAppWithNameAndFail('žýá', appService)
    await createAppWithNameAndFail('#appp', appService)
    await createAppWithNameAndFail('with space', appService)
    await createAppWithNameAndFail('weirdChars()', appService)

    // all will succeed
    await createAppWithNameAndSucceed('App', appService)
    await createAppWithNameAndSucceed('App01.1', appService)
    await createAppWithNameAndSucceed('app_0_1-yes', appService)
  })

  it('save app - validate instance', async() => {
    const appService = new AppService(em, platformClient)
    const appInput: AppInput = getDefaultApp()

    appInput.instance_type = 'nonsense'

    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal(`The app 'instance type' must be one of: ${Object.keys(allowedInstanceTypes)}`)
    }
  })

  it('save app - validate package', async() => {
    const appService = new AppService(em, platformClient)
    const appInput: AppInput = getDefaultApp()

    appInput.packages = ['nonsense']

    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal('The package \'nonsense\' is not a valid Ubuntu package.')
    }
  })

  it('save app - validate assets', async() => {
    const appService = new AppService(em, platformClient)
    const appInput: AppInput = getDefaultApp()
    const asset1 = create.assetHelper.create(em, {user}, {name: "asset-1"})
    await em.flush()

    appInput.ordered_assets = [asset1.uid, 'non-existing']

    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal('The app assets with uids \'["non-existing"]\' do not exist or are not accessible by you.')
    }
  })

  it('save app - validate inputs and outputs', async() => {
    const appService = new AppService(em, platformClient)
    const appInput: AppInput = getDefaultApp()
    const intSpec = getSpec('', 'int', 'intHelp', 'intLabel', false, 1, [1, 2, 3])
    appInput.input_spec = [intSpec]

    // empty name
    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal('The input name cannot be empty.')
    }

    // incorrect name
    intSpec.name = "na me"
    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal(`The input name 'na me' can only contain the characters A-Z, a-z, 0-9, ` +
        '\'.\' (period), \'_\' (underscore) and \'-\' (dash).')
    }

    // duplicate
    intSpec.name = 'name'
    appInput.input_spec = [intSpec, intSpec]
    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal(`Duplicate definitions for input named ${intSpec.name}.`)
    }

    // missing class
    intSpec.class = ''
    appInput.input_spec = [intSpec]
    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal(`The input named ${intSpec.name} is missing type.`)
    }

    // invalid class
    intSpec.class = 'object'
    try {
      await appService.create(appInput, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal(`The input named ${intSpec.name} contains invalid type.`)
    }
  })

  it('save app - array as inputs and outputs', async() => {
    const appService = new AppService(em, platformClient)
    const appInput: AppInput = getDefaultApp()

    const fileSpec = getSpec('file_array', 'array:file', '', 'inputArray', false, [], [1, 2, 3])
    appInput.input_spec = [fileSpec]
    const stringSpec = getSpec('string_array', 'array:string', '', 'outputArray', false, [], [])
    appInput.output_spec = [stringSpec]

    const result = await appService.create(appInput, user.id)
    em.clear()

    const loadedApp = await em.findOneOrFail(App, {uid: result})
    expect(loadedApp.spec.input_spec[0].class).to.equal('array:file')
    expect(loadedApp.spec.output_spec[0].class).to.equal('array:string')
  })
})
