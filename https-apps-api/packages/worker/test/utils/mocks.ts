import sinon from 'sinon'
import Bull, { Job } from 'bull'
import { handler } from '../../src/jobs'

const sandbox = sinon.createSandbox()

// LOCAL stubs for queue handling
const fakes = {
  // add to queue triggers execution immediately
  addToQueueStub: sinon.stub().callsFake(async input => {
    await handler({ data: input } as Job)
  }),
  getJobCountsStub: sinon.stub(),
  // Stubbing getRepeatableJobs to avoid jobs clearing code crashing during tests
  getRepeatableJobsStub: sinon.stub().callsFake(() => {
    return []
  }),
  removeJobsStub: sinon.stub(),
  removeRepeatableStub: sinon.stub(),
}

const mocksSetup = () => {
  sandbox.replace(Bull.prototype, 'add', fakes.addToQueueStub)
  sandbox.replace(Bull.prototype, 'getJobCounts', fakes.getJobCountsStub)
  sandbox.replace(Bull.prototype, 'getRepeatableJobs', fakes.getRepeatableJobsStub)
  sandbox.replace(Bull.prototype, 'removeJobs', fakes.removeJobsStub)
  sandbox.replace(Bull.prototype, 'removeRepeatable', fakes.removeRepeatableStub)
}

const mocksReset = () => {
  fakes.addToQueueStub.resetHistory()
  fakes.getJobCountsStub.resetHistory()
  fakes.getRepeatableJobsStub.resetHistory()
  fakes.removeJobsStub.resetHistory()
  fakes.removeRepeatableStub.resetHistory()
}

const mocksRestore = () => {
  sandbox.restore()
}

export { fakes, mocksSetup, mocksRestore, mocksReset }