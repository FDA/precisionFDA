import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { App } from '@shared/domain/app/app.entity'
import { AppService } from '@shared/domain/app/services/app.service'
import { CliRunAppDTO } from '@shared/domain/cli/dto/cli-run-app.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Resource, User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { STATIC_SCOPE } from '@shared/enums'
import { InvalidStateError } from '@shared/errors'
import { AppRunFacade } from '@shared/facade/app/app-run.facade'
import { CliRunAppFacade } from '../../../src/facade/cli/cli-run-app.facade'

const APP_UID = 'app-Gxxxxxxxxxxxxxxxx-1' as Uid<'app'>
const JOB_UID = 'job-Gyyyyyyyyyyyyyy-1' as Uid<'job'>
const USER_ID = 42
const DXUSER = 'user-test'
const USER_JOB_LIMIT = 200

function createApp(overrides: Record<string, unknown> = {}): Partial<App> {
  return {
    title: 'My HTTPS App',
    isHTTPS: (): boolean => true,
    isPublic: (): boolean => true,
    ...overrides,
  }
}

function createUser(overrides: Record<string, unknown> = {}): Partial<User> {
  return {
    id: USER_ID,
    cloudResourceSettings: {
      job_limit: USER_JOB_LIMIT,
      resources: ['baseline-2', 'baseline-4'],
    },
    ...overrides,
  } as unknown as Partial<User>
}

describe('CliRunAppFacade', () => {
  let getValidAccessibleAppStub: SinonStub
  let loadEntityStub: SinonStub
  let appRunFacadeRunStub: SinonStub
  let facade: CliRunAppFacade

  beforeEach(() => {
    getValidAccessibleAppStub = stub().resolves(createApp())
    loadEntityStub = stub().resolves(createUser())
    appRunFacadeRunStub = stub().resolves({ id: JOB_UID })

    const userContext = {
      id: USER_ID,
      dxuser: DXUSER,
      loadEntity: loadEntityStub,
    } as unknown as UserContext

    const appService = {
      getValidAccessibleApp: getValidAccessibleAppStub,
    } as unknown as AppService

    const appRunFacade = {
      run: appRunFacadeRunStub,
    } as unknown as AppRunFacade

    facade = new CliRunAppFacade(userContext, appService, appRunFacade)
  })

  it('throws InvalidStateError when app is not HTTPS', async () => {
    getValidAccessibleAppStub.resolves(createApp({ isHTTPS: () => false }))

    try {
      await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).to.be.instanceOf(InvalidStateError)
      expect((err as Error).message).to.include('Only public HTTPS app')
    }
  })

  it('throws InvalidStateError when app is not public', async () => {
    getValidAccessibleAppStub.resolves(createApp({ isPublic: () => false }))

    try {
      await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).to.be.instanceOf(InvalidStateError)
      expect((err as Error).message).to.include('Only public HTTPS app')
    }
  })

  it('throws InvalidStateError when app is neither HTTPS nor public', async () => {
    getValidAccessibleAppStub.resolves(createApp({ isHTTPS: () => false, isPublic: () => false }))

    try {
      await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).to.be.instanceOf(InvalidStateError)
    }
  })

  // --- Delegation ---

  it('delegates to appRunFacade.run with the correct appUid', async () => {
    await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)

    expect(appRunFacadeRunStub.calledOnce).to.be.true()
    expect(appRunFacadeRunStub.firstCall.args[0]).to.equal(APP_UID)
  })

  it('returns the job id from appRunFacade.run', async () => {
    const result = await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)

    expect(result).to.deep.equal({ id: JOB_UID })
  })

  it('applies default name from app title when body.name is not provided', async () => {
    await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.name).to.equal('My HTTPS App-cli')
  })

  it('uses provided name when body.name is set', async () => {
    await facade.runApp(APP_UID, { name: 'custom-name' } as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.name).to.equal('custom-name')
  })

  it('defaults scope to STATIC_SCOPE.PRIVATE when body.scope is not provided', async () => {
    await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.scope).to.equal(STATIC_SCOPE.PRIVATE)
  })

  it('uses provided scope when body.scope is set', async () => {
    await facade.runApp(APP_UID, { scope: 'space-5' } as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.scope).to.equal('space-5')
  })

  it('defaults instanceType to baseline-2 when body.instanceType is not provided', async () => {
    await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.instanceType).to.equal('baseline-2')
  })

  it('uses provided instanceType when body.instanceType is set', async () => {
    await facade.runApp(APP_UID, { instanceType: 'baseline-4' } as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.instanceType).to.equal('baseline-4')
  })

  it('defaults jobLimit to user cloudResourceSettings.job_limit', async () => {
    await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.jobLimit).to.equal(USER_JOB_LIMIT)
  })

  it('uses provided jobLimit when body.jobLimit is set', async () => {
    await facade.runApp(APP_UID, { jobLimit: 10 } as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.jobLimit).to.equal(10)
  })

  it('defaults inputs to empty object when body.inputs is not provided', async () => {
    await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.inputs).to.deep.equal({})
  })

  it('defaults outputFolderPath to empty string when body.outputFolderPath is not provided', async () => {
    await facade.runApp(APP_UID, {} as unknown as CliRunAppDTO)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.outputFolderPath).to.equal('')
  })

  it('passes all body values through when every field is provided', async () => {
    const body = {
      name: 'full-run',
      scope: 'space-99',
      instanceType: 'baseline-4' as Resource,
      jobLimit: 50,
      inputs: { snapshot: 'snap-1' },
      outputFolderPath: '/output',
    } as unknown as CliRunAppDTO

    await facade.runApp(APP_UID, body)

    const runInput = appRunFacadeRunStub.firstCall.args[1]
    expect(runInput.name).to.equal('full-run')
    expect(runInput.scope).to.equal('space-99')
    expect(runInput.instanceType).to.equal('baseline-4')
    expect(runInput.jobLimit).to.equal(50)
    expect(runInput.inputs).to.deep.equal({ snapshot: 'snap-1' })
    expect(runInput.outputFolderPath).to.equal('/output')
  })
})
