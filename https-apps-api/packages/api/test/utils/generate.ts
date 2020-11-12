import Chance from 'chance'
import { nanoid } from 'nanoid'
import { User, Job } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { APP_HTTPS_SUBTYPE } from '@pfda/https-apps-shared/src/domain/app/app.enum'

const chance = new Chance()

const random = {
  firstName: () => chance.first(),
  lastName: () => chance.last(),
  email: () => chance.email(),
  password: () => chance.string({ length: 20 }),
  dxstr: (): string => nanoid(),
}

// generators fill in random data, usually without foreign keys

const user = {
  simple: (): Partial<User> => ({
    firstName: random.firstName(),
    lastName: random.lastName(),
    dxuser: `user-${random.dxstr()}`,
  }),
}

const app = {
  runAppInput: (): AnyObject => ({
    instanceType: 'baseline-2',
    duration: 30,
    httpsAppType: APP_HTTPS_SUBTYPE.JUPYTER,
  }),
}

const job = {
  simple: (): Partial<Job> => {
    const dxid = `job-${random.dxstr()}`
    return {
      dxid,
      project: `project-${random.dxstr()}`,
      runData: JSON.stringify({ run_instance_type: 'baseline-8', run_inputs: {}, run_outputs: {} }),
      describe: JSON.stringify({ id: dxid }),
      state: JOB_STATE.IDLE,
      name: chance.name(),
      scope: 'private',
      uid: `${dxid}-1`,
    }
  },
  jobId: () => 'job-FyZg2z000B72xG6b3yVY5BBK',
}

export { random, user, job, app }
