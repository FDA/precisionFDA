import Chance from 'chance'
import { nanoid } from 'nanoid'
import { User, Job, App } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE, JOB_DB_ENTITY_TYPE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { APP_HTTPS_SUBTYPE, ENTITY_TYPE } from '@pfda/https-apps-shared/src/domain/app/app.enum'

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
    jupyterProject: `project-${random.dxstr()}`,
    ttydProject: `project-${random.dxstr()}`,
    // deprecated for now
    // cloudWorkstationProject: `project-${random.dxstr()}`,
    // httpsProject: `project-${random.dxstr()}`,
  }),
}

const app = {
  jupyterAppSpecData: () =>
    JSON.stringify({
      internet_access: true,
      instance_type: 'baseline-4',
      output_spec: [],
      input_spec: [
        {
          name: 'duration',
          class: 'int',
          default: 240,
          label: 'Duration',
          help:
            '(Optional) Initial duration of the JupyterLab interactive environment in minutes. Ignored when cmd argument is specified.',
          optional: true,
        },
        {
          name: 'imagename',
          class: 'string',
          label: 'Image name',
          help:
            '(Optional) Name of a Docker image, available in a Docker registry (e.g. DockerHub, Quay.io),',
          optional: true,
        },
        {
          name: 'snapshot',
          class: 'file',
          label: 'Snapshot',
          help: '(Optional) Snapshot of the JupyterLab Docker environment.',
          optional: true,
          patterns: ['*.tar.gz', '*.tar'],
        },
        {
          name: 'in',
          class: 'array:file',
          label: 'Input files',
          help: '(Optional) Input files. If cmd is not provided this option is ignored.',
          optional: true,
        },
        {
          name: 'cmd',
          class: 'string',
          label: 'Command line',
          help:
            '(Optional) Command to execute in the JupyterLab environment. View the app Readme for details.',
          optional: true,
        },
        {
          name: 'feature',
          class: 'string',
          default: 'PYTHON_R',
          label: 'Feature',
          help:
            'Additional features needed in the JupyterLab environment. See Readme for more information. When a Docker environment snapshot is provided this choice is ignored.',
          optional: true,
          choices: ['PYTHON_R', 'ML_IP'],
        },
      ],
    }),
  simple: (): Partial<App> => {
    const dxid = `app-${random.dxstr()}`
    return {
      dxid,
      title: 'app-title',
      scope: 'public',
      spec:
        '{"input_spec":[],"output_spec":[],"internet_access":true,"instance_type":"baseline-4"}',
      release: 'default-release-value',
      entityType: ENTITY_TYPE.HTTPS,
    }
  },
  runAppInput: () => ({
    httpsAppType: APP_HTTPS_SUBTYPE.JUPYTER,
    scope: 'public',
    input: {
      duration: 30,
    },
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
      entityType: JOB_DB_ENTITY_TYPE.HTTPS,
    }
  },
  jobId: () => 'job-FyZg2z000B72xG6b3yVY5BBK',
}

export { random, user, job, app }
