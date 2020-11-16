import sinon from 'sinon'
import { client, queue } from '@pfda/https-apps-shared'
import * as generate from './generate'

const sandbox = sinon.createSandbox()

const fakes = {
  client: {
    // stubs or fakes? maybe we could use both
    // stub -> we can override what it returns
    jobDescribeFake: sinon.stub().callsFake(() => ({ result: 'yep' })),
    // fake is immutable
    // jobDescribeFake: sinon.fake.returns({ result: 'yep' }),
    jobCreateFake: sinon.stub().callsFake(() => ({ id: generate.job.jobId() })),
  },
  queue: {
    createJobSyncTaskFake: sinon.fake(),
  },
}

const mocksSetup = () => {
  // client
  sandbox.replace(client, 'jobDescribe', fakes.client.jobDescribeFake)
  sandbox.replace(client, 'jobCreate', fakes.client.jobCreateFake)
  // queue
  sandbox.replace(queue, 'createJobSyncTask', fakes.queue.createJobSyncTaskFake)
}

const mocksRestore = () => {
  sandbox.restore()
}

export { fakes, mocksSetup, mocksRestore }
