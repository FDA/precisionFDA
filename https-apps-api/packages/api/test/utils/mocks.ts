import sinon from 'sinon'
import { client } from '@pfda/https-apps-shared'

const sandbox = sinon.createSandbox()

const fakes = {
  client: {
    // stubs or fakes? maybe we could use both
    // stub -> we can override what it returns
    jobDescribeFake: sinon.stub().callsFake(() => ({ result: 'yep' })),
    // fake is immutable
    // jobDescribeFake: sinon.fake.returns({ result: 'yep' }),
  },
}

const mocksSetup = () => {
  // client
  sandbox.replace(client, 'jobDescribe', fakes.client.jobDescribeFake)
}

const mocksRestore = () => {
  sandbox.restore()
}

export { fakes, mocksSetup, mocksRestore }
