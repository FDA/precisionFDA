/* eslint-disable max-len */
import Chance from 'chance'
import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'
import { entities } from '../domain'
import { JOB_STATE, JOB_DB_ENTITY_TYPE } from '../domain/job/job.enum'
import { ENTITY_TYPE } from '../domain/app/app.enum'
import {
  STATUS as DB_CLUSTER_STATUS,
  ENGINE as DB_CLUSTER_ENGINE,
  ENGINES,
} from '../domain/db-cluster/db-cluster.enum'
import { STATIC_SCOPE } from '../enums'
import type { AnyObject, UserCtx } from '../types'
import {
  FILE_STATE_DX,
  FILE_STI_TYPE,
  FILE_ORIGIN_TYPE,
  PARENT_TYPE,
} from '../domain/user-file/user-file.types'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '../domain/space-membership/space-membership.enum'
import {
  PARENT_TYPE as SPACE_EVENT_PARENT_TYPE,
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '../domain/space-event/space-event.enum'
import { CHALLENGE_STATUS } from '../domain/challenge/challenge.enum'
import { TASK_TYPE } from '../queue/task.input'
import { SyncDbClusterOperation } from '../domain/db-cluster'
import { SyncJobOperation } from '../domain/job'
import { SyncFilesStateOperation } from '../domain/user-file'
import { COMPARISON_STATE } from '../domain/comparison/comparison.entity'
import { USER_STATE } from '../domain/user/user.entity'
import { ExpertScope, ExpertState } from '../domain/expert/expert.entity'

const chance = new Chance()

const random = {
  firstName: () => chance.first(),
  lastName: () => chance.last(),
  email: () => chance.email(),
  password: () => chance.string({ length: 20 }),
  dxstr: (): string => nanoid(),
  word: () => chance.word(),
  description: () => chance.sentence({ words: 2 }),
  chance,
}

// generators fill in random data, usually without foreign keys

const user = {
  simple: (): Partial<InstanceType<typeof entities.User>> => ({
    firstName: random.firstName(),
    lastName: random.lastName(),
    dxuser: `user-${random.dxstr()}`,
    privateFilesProject: `project-${random.dxstr()}`,
    publicFilesProject: `project-${random.dxstr()}`,
    email: 'test@nexus-mail.com',
    normalizedEmail: 'normalized@nexus-mail.com',
    userState: USER_STATE.ENABLED,
    // privateComparisonsProject: `project-${random.dxstr()}`,
    // publicComparisonsProject: `project-${random.dxstr()}`,
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
  ttydAppSpecData: () =>
    JSON.stringify({
      internet_access: true,
      instance_type: 'baseline-4',
      output_spec: [],
      input_spec: [
        {
          name: 'port',
          class: 'int',
          default: 443,
          label: 'ttyd port',
          help: "ttyd shell will appear on this port",
          optional: true,
          choices: [443, 8081, 8080],
        },
      ],
  }),
  regular: (): Partial<InstanceType<typeof entities.App>> => {
    const dxid = `app-${random.dxstr()}`
    return {
      dxid,
      uid: `${dxid}-1`,
      title: 'app-title',
      scope: 'public',
      spec:
        '{"input_spec":[],"output_spec":[],"internet_access":true,"instance_type":"baseline-4"}',
      release: 'default-release-value',
      entityType: ENTITY_TYPE.NORMAL,
      version: '1',
      revision: 1,
      readme: 'readme',
      internal: 'internal',
      verified: true,
      devGroup: 'devGroup',
    }
  },
  https: (): Partial<InstanceType<typeof entities.App>> => {
    const dxid = `app-${random.dxstr()}`
    return {
      dxid,
      title: 'https-app-title',
      scope: 'public',
      spec:
        '{"input_spec":[],"output_spec":[],"internet_access":true,"instance_type":"baseline-4"}',
      release: 'default-release-value',
      entityType: ENTITY_TYPE.HTTPS,
      verified: true,
    }
  },
  rshiny: (): Partial<InstanceType<typeof entities.App>> => {
    const dxid = `app-${random.dxstr()}`
    return {
      dxid,
      title: 'app-rshiny-title',
      scope: 'public',
      entityType: ENTITY_TYPE.HTTPS,
      release: 'default-release-value',
      spec:
        '{"input_spec":[{"name":"app_gz","class":"file","label":"Gzip archive of Shiny app containing R script(s)","help":"","optional":false,"patterns":["*.tar.gz"]}],"output_spec":[],"internet_access":true,"instance_type":"baseline-4"}',
    }
  },
  runAppInput: (): AnyObject => ({
    scope: 'private',
    jobLimit: 32.67,
    input: {
      duration: 30,
    },
  }),
  runTtydAppInput: () => ({
    scope: 'private',
    jobLimit: 50,
    input: {
      port: 8080,
    },
  }),
  runRshinyAppInput: () => ({
    scope: 'private',
    jobLimit: 50,
    input: {
      app_gz: 'app-gzipped-file',
    },
  }),
}

const job = {
  simple: (): Partial<InstanceType<typeof entities.Job>> => {
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
  regular: (): Partial<InstanceType<typeof entities.Job>> => {
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
      entityType: JOB_DB_ENTITY_TYPE.REGULAR,
    }
  },
  jobId: () => 'job-FyZg2z000B72xG6b3yVY5BBK',
}

const userFile = {
  simple: (customDxid?: string): Partial<InstanceType<typeof entities.UserFile>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}`
    return {
      dxid,
      uid: `${dxid}-1`,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: 'private',
      entityType: FILE_ORIGIN_TYPE.HTTPS,
      state: FILE_STATE_DX.CLOSED,
      parentType: PARENT_TYPE.USER,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
  simpleUploaded: (customDxid?: string): Partial<InstanceType<typeof entities.UserFile>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}`
    return {
      dxid,
      uid: `${dxid}-1`,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: 'private',
      entityType: FILE_ORIGIN_TYPE.REGULAR,
      state: FILE_STATE_DX.CLOSED,
      parentType: PARENT_TYPE.USER,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
  simpleJobOutput: (jobId: number, customDxid?: string): Partial<InstanceType<typeof entities.UserFile>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}`
    return {
      dxid,
      uid: `${dxid}-1`,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: 'private',
      entityType: FILE_ORIGIN_TYPE.REGULAR,
      state: FILE_STATE_DX.CLOSED,
      parentType: PARENT_TYPE.JOB,
      parentId: jobId,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
  simpleComparisonOutput: (comparisonId: number, customDxid?: string): Partial<InstanceType<typeof entities.UserFile>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}`
    return {
      dxid,
      uid: `${dxid}-1`,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: 'private',
      entityType: FILE_ORIGIN_TYPE.REGULAR,
      state: FILE_STATE_DX.CLOSED,
      parentType: PARENT_TYPE.COMPARISON,
      parentId: comparisonId,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
}

const asset = {
  simple: (customDxid?: string): Partial<InstanceType<typeof entities.Asset>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}`
    return {
      dxid,
      uid: `${dxid}-1`,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: 'private',
      entityType: FILE_ORIGIN_TYPE.REGULAR,
      state: FILE_STATE_DX.CLOSED,
      parentType: PARENT_TYPE.USER,
      stiType: FILE_STI_TYPE.ASSET,
    }
  },
}

const folder = {
  simple: (): Partial<InstanceType<typeof entities.Folder>> => {
    // folders do not have it
    // const dxid = `file-${random.dxstr()}`
    return {
      name: chance.name(),
      project: undefined,
      dxid: undefined,
      scope: 'private',
      entityType: FILE_ORIGIN_TYPE.HTTPS,
      parentId: 1,
      parentType: PARENT_TYPE.JOB,
      stiType: FILE_STI_TYPE.FOLDER,
      locked: false
    }
  },
  simpleLocal: (): Partial<InstanceType<typeof entities.Folder>> => {
    return {
      name: chance.word(),
      project: undefined,
      dxid: undefined,
      scope: 'private',
      entityType: FILE_ORIGIN_TYPE.REGULAR,
      parentId: 1,
      parentType: PARENT_TYPE.USER,
      stiType: FILE_STI_TYPE.FOLDER,
      locked: false
    }
  },
}

const tag = {
  simple: (): Partial<InstanceType<typeof entities.Tag>> => ({
    name: chance.name(),
    taggingCount: 0,
  }),
}

const tagging = {
  userfileDefaults: (): Partial<InstanceType<typeof entities.Tagging>> => ({
    taggableType: 'Node',
    taggerType: 'User',
    context: 'tags',
  }),
}

const space = {
  simple: (): Partial<InstanceType<typeof entities.Space>> => ({
    name: chance.word(),
    state: 1, // ACTIVE,
    type: 1, // review type
    guestDxOrg: `org-pfda..space_guest_${random.dxstr()}`,
    hostDxOrg: `org-pfda..space_host_${random.dxstr()}`,
    spaceId: null as any,
    hostProject: null as any,
    guestProject: null as any,
    description: 'desc', 
    meta: 'meta',
  }),
  group: (): Partial<InstanceType<typeof entities.Space>> => ({
    name: chance.word(),
    state: 1,
    type: 0, // GROUP type
    spaceId: null as any,
    hostProject: null as any,
    guestProject: null as any,
  }),
  // represents space on platform
  projectId: () => `project-j47b1k3z8Jqqv001213v312j1`
}

const spaceMembership = {
  simple: (): Partial<InstanceType<typeof entities.SpaceMembership>> => ({
    active: true,
    side: SPACE_MEMBERSHIP_SIDE.GUEST,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
  }),
}

const spaceEvent = {
  commentAdded: (): Partial<InstanceType<typeof entities.SpaceEvent>> => ({
    entityId: 1,
    entityType: SPACE_EVENT_PARENT_TYPE.COMMENT,
    activityType: SPACE_EVENT_ACTIVITY_TYPE.comment_added,
    objectType: SPACE_EVENT_OBJECT_TYPE.COMMENT,
    side: SPACE_MEMBERSHIP_SIDE.GUEST,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
  }),
  contentAdded: (): Partial<InstanceType<typeof entities.SpaceEvent>> => ({
    entityId: 1,
    entityType: SPACE_EVENT_PARENT_TYPE.JOB,
    activityType: SPACE_EVENT_ACTIVITY_TYPE.job_added,
    objectType: SPACE_EVENT_OBJECT_TYPE.JOB,
    side: SPACE_MEMBERSHIP_SIDE.GUEST,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
  }),
}

const challenge = {
  simple: (): Partial<InstanceType<typeof entities.Challenge>> => ({
    name: 'test-challenge',
    scope: 'public',
    status: CHALLENGE_STATUS.SETUP,
  }),
}

const comment = {
  simple: (): Partial<InstanceType<typeof entities.Comment>> => ({
    body: chance.sentence(),
    commentableType: 'Space',
    contentObjectType: 'Job',
    commentableId: 1,
    contentObjectId: 1,
  }),
}

const comparison = {
  simple: (): Partial<InstanceType<typeof entities.Comparison>> => ({
    name: 'Test Comparison',
    description: chance.sentence(),
    state: COMPARISON_STATE.DONE,
  }),
}

const dbCluster = {
  simple: (): Partial<InstanceType<typeof entities.DbCluster>> => {
    const dxid = `dbcluster-${random.dxstr()}`
    return {
      dxid: dxid,
      uid: `${dxid}-1`,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      description: random.description(),
      scope: STATIC_SCOPE.PRIVATE,
      dxInstanceClass: 'db_std1_x2',
      engineVersion: '5.7.12',
      host: `dbcluster.${chance.word()}.com`,
      port: chance.pickone(['3306', '3307', '3308']),
      statusAsOf: DateTime.now().minus({ minutes: chance.natural({ min: 1, max: 30 }) }).toJSDate(),
      status: DB_CLUSTER_STATUS.AVAILABLE,
      engine: DB_CLUSTER_ENGINE.MYSQL,
    }
  },
  createInput: (): AnyObject => ({
    project: `project-${random.dxstr()}`,
    name: chance.name(),
    description: random.description(),
    scope: STATIC_SCOPE.PRIVATE,
    dxInstanceClass: 'db_std1_x2',
    engine: ENGINES.MYSQL,
    engineVersion: '5.7.mysql_aurora.2.07.8',
    adminPassword: random.password(),
  }),
}

const expert = {
  simple: (): Partial<InstanceType<typeof entities.Expert>> => {
    const expertName = chance.name()
    const fileDxid = `file-${random.dxstr()}-1`
    return {
      scope: ExpertScope.PUBLIC,
      state: ExpertState.OPEN,
      meta: {
        _prefname: expertName,
        _about: `About - ${expertName}`,
        _blog: `Blog - ${expertName}`,
        _blog_title: `Blog Title - ${expertName}`,
        _challenge: `Challenge - ${expertName}`,
        _image_id: fileDxid,
      }
    }
  },
}

const bullQueue = {
  syncDbClusterStatus: (dbClusterDxid: string, userContext: UserCtx) => ({
    data: {
      payload: {
        dxid: dbClusterDxid,
      },
      type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
      user: userContext,
    },
  }),
  syncFilesState: (userContext: UserCtx) => ({
    data: {
      type: TASK_TYPE.SYNC_FILES_STATE,
      user: userContext,
    },
  }),
  syncJobStatus: (jobDxid: string, userContext: UserCtx) => ({
    data: {
      payload: {
        dxid: jobDxid,
      },
      type: TASK_TYPE.SYNC_JOB_STATUS,
      user: userContext,
    },
  }),
}

const bullQueueRepeatable = {
  syncDbClusterStatus: (dbClusterDxid: string) => ({
    key: `__default__:${SyncDbClusterOperation.getBullJobId(dbClusterDxid)}:::*/2 * * * *`,
    name: '__default__',
    id: SyncDbClusterOperation.getBullJobId(dbClusterDxid),
    endDate: null,
    tz: null,
    cron: '*/2 * * * *',
    every: null,
    next: Date.now() + (60 * 1000),
  }),
  syncFilesState: (dxuser: string) => ({
    key: `__default__:${SyncFilesStateOperation.getBullJobId(dxuser)}:::*/2 * * * *`,
    name: '__default__',
    id: SyncFilesStateOperation.getBullJobId(dxuser),
    endDate: null,
    tz: null,
    cron: '*/2 * * * *',
    every: null,
    next: Date.now() + (60 * 1000),
  }),
  syncJobStatus: (jobDxid: string) => ({
    key: `__default__:${SyncJobOperation.getBullJobId(jobDxid)}:::*/2 * * * *`,
    name: '__default__',
    id: SyncJobOperation.getBullJobId(jobDxid),
    endDate: null,
    tz: null,
    cron: '*/2 * * * *',
    every: null,
    next: Date.now() + (60 * 1000),
  }),
  // In orphaned cases the 'next' timestamp (in milliseconds) has passed and
  // they sit idle in BullQueue
  syncJobStatusOrphaned: jobDxid => ({
    key: `__default__:${SyncJobOperation.getBullJobId(jobDxid)}:::*/2 * * * *`,
    name: '__default__',
    id: SyncJobOperation.getBullJobId(jobDxid),
    endDate: null,
    tz: null,
    cron: '*/2 * * * *',
    every: null,
    next: Date.now() - (5 * 60 * 1000),
  }),
}

export {
  random,
  user,
  job,
  app,
  userFile,
  folder,
  tag,
  tagging,
  asset,
  space,
  spaceMembership,
  spaceEvent,
  comment,
  comparison,
  challenge,
  dbCluster,
  expert,
  bullQueue,
  bullQueueRepeatable,
}
