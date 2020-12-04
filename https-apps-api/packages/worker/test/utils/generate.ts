import Chance from 'chance'
import { nanoid } from 'nanoid'
import { User, Job, App, UserFile } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { APP_HTTPS_SUBTYPE } from '@pfda/https-apps-shared/src/domain/app/app.enum'
import type { AnyObject } from '@pfda/https-apps-shared/src/types'
import {
  FILE_STATE,
  FILE_STI_TYPE,
  FILE_TYPE,
  PARENT_TYPE,
} from '@pfda/https-apps-shared/src/domain/user-file/user-file.enum'
// todo: should be in shared helpers

const chance = new Chance()

const random = {
  firstName: () => chance.first(),
  lastName: () => chance.last(),
  email: () => chance.email(),
  password: () => chance.string({ length: 20 }),
  dxstr: (): string => nanoid(),
  chance,
}

// generators fill in random data, usually without foreign keys

const user = {
  simple: (): Partial<User> => ({
    firstName: random.firstName(),
    lastName: random.lastName(),
    dxuser: `user-${random.dxstr()}`,
    jupyterProject: `project-${random.dxstr()}`,
    ttydProject: `project-${random.dxstr()}`,
    // cloudWorkstationProject: `project-${random.dxstr()}`,
    // httpsProject: `project-${random.dxstr()}`,
  }),
}

const app = {
  simple: (): Partial<App> => {
    const dxid = `app-${random.dxstr()}`
    return {
      dxid,
      release: 'default-release-value',
    }
  },
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

const userFile = {
  simple: (): Partial<UserFile> => {
    const dxid = `file-${random.dxstr()}`
    return {
      dxid,
      uid: `${dxid}-1`,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: 'private',
      entityType: FILE_TYPE.REGULAR,
      state: FILE_STATE.CLOSED,
      parentId: 1,
      parentType: PARENT_TYPE.USER,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
}

export { random, user, job, app, userFile }
