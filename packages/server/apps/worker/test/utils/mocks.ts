import { mockHandler } from '@worker-test/utils/handler-mock'
import Bull, { Job } from 'bull'
import sinon, { SinonSandbox, SinonStub } from 'sinon'

const sandbox: SinonSandbox = sinon.createSandbox()

type QueueMocks = {
  addToQueueStub: SinonStub
  getJobStub: SinonStub
  getJobCountsStub: SinonStub
  getRepeatableJobsStub: SinonStub
  removeJobsStub: SinonStub
  removeRepeatableStub: SinonStub
}

// LOCAL stubs for queue handling
const fakes: QueueMocks = {
  // add to queue triggers execution immediately
  addToQueueStub: sinon.stub().callsFake(async (...args: unknown[]): Promise<void> => {
    await mockHandler({ data: args[1] } as Job)
  }),
  getJobStub: sinon.stub(),
  getJobCountsStub: sinon.stub(),
  // Stubbing getRepeatableJobs to avoid jobs clearing code crashing during tests
  getRepeatableJobsStub: sinon.stub().callsFake((): unknown[] => {
    return []
  }),
  removeJobsStub: sinon.stub(),
  removeRepeatableStub: sinon.stub(),
}

const mocksSetup = (): void => {
  sandbox.replace(Bull.prototype, 'add', fakes.addToQueueStub)
  sandbox.replace(Bull.prototype, 'getJob', fakes.getJobStub)
  sandbox.replace(Bull.prototype, 'getJobCounts', fakes.getJobCountsStub)
  sandbox.replace(Bull.prototype, 'getRepeatableJobs', fakes.getRepeatableJobsStub)
  sandbox.replace(Bull.prototype, 'removeJobs', fakes.removeJobsStub)
  sandbox.replace(Bull.prototype, 'removeRepeatable', fakes.removeRepeatableStub)
}

const mocksReset = (): void => {
  fakes.addToQueueStub.resetHistory()
  fakes.getJobStub.resetHistory()
  fakes.getJobCountsStub.resetHistory()
  fakes.getRepeatableJobsStub.resetHistory()
  fakes.removeJobsStub.resetHistory()
  fakes.removeRepeatableStub.resetHistory()
}

const mocksRestore = (): void => {
  sandbox.restore()
}

export { fakes, mocksReset, mocksRestore, mocksSetup }
