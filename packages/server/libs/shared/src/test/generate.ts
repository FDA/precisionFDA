/* eslint-disable max-len */
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { UId } from '@shared/domain/entity/domain/uid'
import { Job } from '@shared/domain/job/job.entity'
import { JobRunData } from '@shared/domain/job/job.types'
import { SyncJobOperation } from '@shared/domain/job/ops/synchronize'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { Note } from '@shared/domain/note/note.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Tag } from '@shared/domain/tag/tag.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { SyncFilesStateOperation } from '@shared/domain/user-file/ops/sync-files-state'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import Chance from 'chance'
import crypto from 'crypto'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'
import { App, AppSpec, Internal } from '../domain/app/app.entity'
import { ENTITY_TYPE } from '../domain/app/app.enum'
import { CHALLENGE_STATUS } from '../domain/challenge/challenge.enum'
import { COMPARISON_STATE, Comparison } from '../domain/comparison/comparison.entity'
import {
  ENGINE as DB_CLUSTER_ENGINE,
  STATUS as DB_CLUSTER_STATUS,
  ENGINES,
} from '../domain/db-cluster/db-cluster.enum'
import { Expert, ExpertScope, ExpertState } from '../domain/expert/expert.entity'
import { JOB_DB_ENTITY_TYPE, JOB_STATE } from '../domain/job/job.enum'
import {
  SPACE_EVENT_ACTIVITY_TYPE,
  ENTITY_TYPE as SPACE_EVENT_ENTITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '../domain/space-event/space-event.enum'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '../domain/space-membership/space-membership.enum'
import { FILE_STATE_DX, FILE_STI_TYPE, PARENT_TYPE } from '../domain/user-file/user-file.types'
import { USER_STATE, User } from '../domain/user/user.entity'
import { STATIC_SCOPE } from '../enums'
import { TASK_TYPE } from '../queue/task.input'
import type { AnyObject, UserCtx } from '../types'

const chance = new Chance()

const random = {
  firstName: () => chance.first(),
  lastName: () => chance.last(),
  email: () => chance.email(),
  password: () => crypto.randomBytes(64).toString('hex'),
  dxstr: (): string => nanoid(),
  word: () => chance.word(),
  description: () => chance.sentence({ words: 2 }),
  chance,
}

// generators fill in random data, usually without foreign keys
const note = {
  simple: (): Partial<InstanceType<typeof Note>> => ({
    title: random.word(),
  }),
}
const user = {
  simple: (): Partial<InstanceType<typeof User>> => ({
    firstName: random.firstName(),
    lastName: random.lastName(),
    dxuser: `user-${random.dxstr()}`,
    email: 'test@nexus-mail.com',
    normalizedEmail: 'normalized@nexus-mail.com',
    userState: USER_STATE.ENABLED,
    lastDataCheckup: new Date(),
    lastLogin: new Date(),
    extras: {
      has_seen_guidelines: false,
      inactivity_email_sent: false,
    },
    privateFilesProject: `project-${random.dxstr()}`,
    publicFilesProject: `project-${random.dxstr()}`,
    privateComparisonsProject: `project-${random.dxstr()}`,
    publicComparisonsProject: `project-${random.dxstr()}`,
  }),
}

const alert = {
  active: () => {
    const now = new Date()
    const startTime = new Date(now.getTime())
    const endTime = new Date(now.getTime())
    startTime.setHours(now.getHours() - 2)
    endTime.setDate(now.getDate() + 2)
    return {
      title: 'Planned Downtime',
      content:
        'Our application will soon be offline for upgrades. Please ensure your work is saved. Thank you.',
      type: 'danger' as 'danger' | 'info' | 'warning',
      startTime: startTime,
      endTime: endTime,
    }
  },
  expired: () => {
    const now = new Date()
    const startTime = new Date(now.getTime())
    const endTime = new Date(now.getTime())
    startTime.setDate(now.getDate() - 3)
    endTime.setDate(now.getDate() - 1)
    return {
      title: 'Scheduled Maintenance',
      content:
        'Scheduled maintenance is coming up, during which the application may be briefly unavailable. Thanks for your patience.',
      type: 'warning' as 'danger' | 'info' | 'warning',
      startTime: startTime,
      endTime: endTime,
    }
  },
  future: () => {
    const now = new Date()
    const startTime = new Date(now.getTime())
    const endTime = new Date(now.getTime())
    startTime.setDate(now.getDate() + 2)
    endTime.setDate(now.getDate() + 4)
    return {
      title: 'System Update',
      content:
        'An exciting system update is on the way, bringing new features. Minimal downtime expected.',
      type: 'info' as 'danger' | 'info' | 'warning',
      startTime: startTime,
      endTime: endTime,
    }
  },
}
const app = {
  jupyterAppSpecData: () => {
    return {
      internet_access: true,
      instance_type: 'baseline-2',
      input_spec: [
        {
          name: 'duration',
          class: 'int',
          default: 240,
          label: 'Duration',
          help: '(Optional) Initial duration of the JupyterLab interactive environment in minutes. Ignored when cmd argument is specified.',
          optional: true,
        },
        {
          name: 'imagename',
          class: 'string',
          label: 'Image name',
          help: '(Optional) Name of a Docker image, available in a Docker registry (e.g. DockerHub, Quay.io),',
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
          help: '(Optional) Command to execute in the JupyterLab environment. View the app Readme for details.',
          optional: true,
        },
        {
          name: 'feature',
          class: 'string',
          default: 'PYTHON_R',
          label: 'Feature',
          help: 'Additional features needed in the JupyterLab environment. See Readme for more information. When a Docker environment snapshot is provided this choice is ignored.',
          optional: true,
          choices: ['PYTHON_R', 'ML_IP'],
        },
      ],
    } as AppSpec
  },
  ttydAppSpecData: () => {
    return {
      internet_access: true,
      instance_type: 'baseline-2',
      // output_spec: [],
      input_spec: [
        {
          name: 'port',
          class: 'int',
          default: 443,
          label: 'ttyd port',
          help: 'ttyd shell will appear on this port',
          optional: true,
          choices: [443, 8081, 8080],
        },
      ],
    } as AppSpec
  },
  ttydAppInternal: () => {
    return {
      ordered_assets: ['file-GQX1jP800Q42p0p3f2QY1zgb-1'],
      packages: ['ipython', 'pkg-config'],
    } as Internal
  },
  ttydAppInternalWithAPI: (version: string) => {
    return {
      ordered_assets: ['file-GQX1jP800Q42p0p3f2QY1zgb-1'],
      platform_tags: [`pfda_workstation_api:${version}`],
      packages: ['ipython', 'pkg-config'],
    } as Internal
  },
  regular: (): Partial<InstanceType<typeof App>> => {
    const dxid = `app-${random.dxstr()}`
    return {
      dxid,
      uid: `${dxid}-1`,
      title: 'app-title',
      scope: 'public',
      spec: {
        input_spec: [],
        output_spec: [],
        internet_access: true,
        instance_type: 'baseline-2',
      },
      release: 'default-release-value',
      entityType: ENTITY_TYPE.NORMAL,
      version: '1',
      revision: 1,
      readme: 'readme',
      internal: {} as unknown as Internal,
      verified: true,
      devGroup: 'devGroup',
    }
  },
  https: (): Partial<InstanceType<typeof App>> => {
    const dxid = `app-${random.dxstr()}`
    return {
      dxid,
      title: 'https-app-title',
      scope: 'public',
      spec: {
        input_spec: [],
        output_spec: [],
        internet_access: true,
        instance_type: 'baseline-2',
      },
      release: 'default-release-value',
      entityType: ENTITY_TYPE.HTTPS,
      verified: true,
    }
  },
  rshiny: (): Partial<InstanceType<typeof App>> => {
    const dxid = `app-${random.dxstr()}`
    return {
      dxid,
      title: 'app-rshiny-title',
      scope: 'public',
      entityType: ENTITY_TYPE.HTTPS,
      release: 'default-release-value',
      spec: {
        input_spec: [
          {
            name: 'app_gz',
            class: 'file',
            label: 'Gzip archive of Shiny app containing R script(s)',
            help: '',
            optional: false,
            patterns: ['*.tar.gz'],
          },
        ],
        output_spec: [],
        internet_access: true,
        instance_type: 'baseline-4',
      },
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
  appSeries: (): Partial<InstanceType<typeof AppSeries>> => {
    const dxid = `app-${random.dxstr()}`
    return {
      dxid,
      name: chance.name(),
      featured: false,
      deleted: false,
      verified: true,
      scope: 'private',
    }
  },
  appId: () => 'app-GP3J1V00XbPPz5qP4QPGxQ08',
}

const appSeries = {
  simple: (): Partial<InstanceType<typeof AppSeries>> => {
    const name = random.word()
    const dxid = `app-${random.dxstr()}-${name}`
    return {
      dxid,
      name,
      scope: 'private',
    }
  },
}

const workflowSeries = {
  simple: (): Partial<InstanceType<typeof WorkflowSeries>> => {
    const name = random.word()
    const dxid = `workflow-${random.dxstr()}-${name}`
    return {
      dxid,
      name,
      scope: 'private',
    }
  },
}

const job = {
  simple: (app: App): Partial<InstanceType<typeof Job>> => {
    const dxid = `job-${random.dxstr()}`
    const runData: JobRunData = { run_inputs: {}, run_instance_type: 'baseline-8', run_outputs: {} }
    const projectId = `project-${random.dxstr()}`
    const jobName = chance.name()
    return {
      dxid,
      project: projectId,
      runData,
      state: JOB_STATE.IDLE,
      name: jobName,
      scope: STATIC_SCOPE.PRIVATE,
      uid: `${dxid}-1`,
      entityType: JOB_DB_ENTITY_TYPE.HTTPS,
      describe: {
        id: dxid,
        name: jobName,
        class: 'job',
        state: JOB_STATE.IDLE,
        project: projectId,
        billTo: projectId,
        executable: app.dxid,
        executableName: app.title,
        runInput: {
          port: 321,
        },
        httpsApp: {
          dns: {
            url: `https://${dxid}.internal.dnanexus.cloud/`,
          },
          ports: [443, 8081],
          shared_access: 'NONE',
          enabled: true,
        },
      },
    }
  },
  regular: (): Partial<InstanceType<typeof Job>> => {
    const dxid = `job-${random.dxstr()}`
    const runData: JobRunData = { run_inputs: {}, run_instance_type: 'baseline-8', run_outputs: {} }
    return {
      dxid,
      project: `project-${random.dxstr()}`,
      runData,
      describe: { id: dxid, class: 'job' } as unknown as JobDescribeResponse,
      state: JOB_STATE.IDLE,
      name: chance.name(),
      scope: STATIC_SCOPE.PRIVATE,
      uid: `${dxid}-1`,
      entityType: JOB_DB_ENTITY_TYPE.REGULAR,
    }
  },
  jobId: () => 'job-FyZg2z000B72xG6b3yVY5BBK',
}

const userFile = {
  simple: (customDxid?: string): Partial<InstanceType<typeof UserFile>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}` as any
    return {
      dxid,
      uid: `${dxid}-1` as UId,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: STATIC_SCOPE.PRIVATE,
      state: FILE_STATE_DX.CLOSED,
      parentId: 1,
      parentType: PARENT_TYPE.JOB,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
  simpleUploaded: (customDxid?: string): Partial<InstanceType<typeof UserFile>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}` as any
    return {
      dxid,
      uid: `${dxid}-1` as UId,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: STATIC_SCOPE.PRIVATE,
      state: FILE_STATE_DX.CLOSED,
      parentId: 1,
      parentType: PARENT_TYPE.USER,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
  simpleJobOutput: (jobId: number, customDxid?: string): Partial<InstanceType<typeof UserFile>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}` as any
    return {
      dxid,
      uid: `${dxid}-1` as UId,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: STATIC_SCOPE.PRIVATE,
      state: FILE_STATE_DX.CLOSED,
      parentType: PARENT_TYPE.JOB,
      parentId: jobId,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
  simpleComparisonOutput: (
    comparisonId: number,
    customDxid?: string,
  ): Partial<InstanceType<typeof UserFile>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}` as any
    return {
      dxid,
      uid: `${dxid}-1` as UId,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: STATIC_SCOPE.PRIVATE,
      state: FILE_STATE_DX.CLOSED,
      parentType: PARENT_TYPE.COMPARISON,
      parentId: comparisonId,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
}

const asset = {
  simple: (customDxid?: string): Partial<InstanceType<typeof Asset>> => {
    const dxid = customDxid ?? `file-${random.dxstr()}` as any
    return {
      dxid,
      uid: `${dxid}-1` as UId,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      scope: STATIC_SCOPE.PRIVATE,
      state: FILE_STATE_DX.CLOSED,
      parentType: PARENT_TYPE.USER,
      stiType: FILE_STI_TYPE.ASSET,
    }
  },
}

const folder = {
  simple: (): Partial<InstanceType<typeof Folder>> => {
    // folders do not have it
    // const dxid = `file-${random.dxstr()}`
    return {
      name: chance.name(),
      project: undefined,
      dxid: undefined,
      scope: STATIC_SCOPE.PRIVATE,
      parentId: 1,
      parentType: PARENT_TYPE.JOB,
      stiType: FILE_STI_TYPE.FOLDER,
      locked: false,
    }
  },
  simpleLocal: (): Partial<InstanceType<typeof Folder>> => {
    return {
      name: chance.word(),
      project: undefined,
      dxid: undefined,
      scope: STATIC_SCOPE.PRIVATE,
      parentId: 1,
      parentType: PARENT_TYPE.USER,
      stiType: FILE_STI_TYPE.FOLDER,
      locked: false,
    }
  },
}

const tag = {
  simple: (): Partial<InstanceType<typeof Tag>> => ({
    name: chance.name(),
    taggingCount: 0,
  }),
}

const tagging = {
  userfileDefaults: (): Partial<InstanceType<typeof Tagging>> => ({
    taggableType: 'Node',
    taggerType: 'User',
    context: 'tags',
  }),
}

const space = {
  simple: (): Partial<InstanceType<typeof Space>> => ({
    name: chance.word(),
    state: 1, // ACTIVE,
    type: 1, // review type
    guestDxOrg: `org-pfda..space_guest_${random.dxstr()}`,
    hostDxOrg: `org-pfda..space_host_${random.dxstr()}`,
    spaceId: null as any,
    hostProject: null as any,
    guestProject: null as any,
    description: 'desc',
    meta: {
      restricted_discussions: false,
      restricted_reviewer: false,
      cts: ''
    }
  }),
  group: (): Partial<InstanceType<typeof Space>> => ({
    name: chance.word(),
    state: 1,
    type: 0, // GROUP type
    spaceId: null as any,
    hostProject: null as any,
    guestProject: null as any,
  }),
  // represents space on platform
  projectId: () => `project-j47b1k3z8Jqqv001213v312j1`,
}

const spaceMembership = {
  simple: (): Partial<InstanceType<typeof SpaceMembership>> => ({
    active: true,
    side: SPACE_MEMBERSHIP_SIDE.GUEST,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
  }),
}

const spaceEvent = {
  commentAdded: (): Partial<InstanceType<typeof SpaceEvent>> => ({
    entityId: 1,
    entityType: SPACE_EVENT_ENTITY_TYPE.COMMENT,
    activityType: SPACE_EVENT_ACTIVITY_TYPE.comment_added,
    objectType: SPACE_EVENT_OBJECT_TYPE.COMMENT,
    side: SPACE_MEMBERSHIP_SIDE.GUEST,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
  }),
  contentAdded: (): Partial<InstanceType<typeof SpaceEvent>> => ({
    entityId: 1,
    entityType: SPACE_EVENT_ENTITY_TYPE.JOB,
    activityType: SPACE_EVENT_ACTIVITY_TYPE.job_added,
    objectType: SPACE_EVENT_OBJECT_TYPE.JOB,
    side: SPACE_MEMBERSHIP_SIDE.GUEST,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
  }),
}

const challenge = {
  simple: (): Partial<InstanceType<typeof Challenge>> => ({
    name: 'test-challenge',
    scope: 'public',
    status: CHALLENGE_STATUS.SETUP,
  }),
}

const comment = {
  simple: (): Partial<InstanceType<typeof Comment>> => ({
    body: chance.sentence(),
    commentableType: 'Space',
    contentObjectType: 'Job',
    //@ts-ignore
    commentableId: 1,
    contentObjectId: 1,
  }),
}

const comparison = {
  simple: (): Partial<InstanceType<typeof Comparison>> => ({
    name: 'Test Comparison',
    description: chance.sentence(),
    state: COMPARISON_STATE.DONE,
    scope: STATIC_SCOPE.PRIVATE,
  }),
}

const dbCluster = {
  simple: (): Partial<InstanceType<typeof DbCluster>> => {
    const dxid = `dbcluster-${random.dxstr()}`
    return {
      dxid: dxid,
      uid: `${dxid}-1` as UId,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      description: random.description(),
      scope: STATIC_SCOPE.PRIVATE,
      dxInstanceClass: 'db_std1_x2',
      engineVersion: '5.7.12',
      host: `dbcluster.${chance.word()}.com`,
      port: chance.pickone(['3306', '3307', '3308']),
      statusAsOf: DateTime.now()
        .minus({ minutes: chance.natural({ min: 1, max: 30 }) })
        .toJSDate(),
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
    engineVersion: '5.7.mysql_aurora.2.07.10',
    adminPassword: random.password(),
  }),
}

const expert = {
  simple: (): Partial<InstanceType<typeof Expert>> => {
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
      },
    }
  },
}

const news = {
  create: (): Partial<InstanceType<typeof NewsItem>> => {
    return {
      title: chance.sentence(),
      content: chance.sentence(),
      link: chance.url(),
      published: true,
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
  syncFilesState: (dxuser: string) => ({
    key: `__default__:${SyncFilesStateOperation.getBullJobId(dxuser)}:::*/2 * * * *`,
    name: '__default__',
    id: SyncFilesStateOperation.getBullJobId(dxuser),
    endDate: null,
    tz: null,
    cron: '*/2 * * * *',
    every: null,
    next: Date.now() + 60 * 1000,
  }),
  syncJobStatus: (jobDxid: string) => ({
    key: `__default__:${SyncJobOperation.getBullJobId(jobDxid)}:::*/2 * * * *`,
    name: '__default__',
    id: SyncJobOperation.getBullJobId(jobDxid),
    endDate: null,
    tz: null,
    cron: '*/2 * * * *',
    every: null,
    next: Date.now() + 60 * 1000,
  }),
  // In orphaned cases the 'next' timestamp (in milliseconds) has passed and
  // they sit idle in BullQueue
  syncJobStatusOrphaned: (jobDxid) => ({
    key: `__default__:${SyncJobOperation.getBullJobId(jobDxid)}:::*/2 * * * *`,
    name: '__default__',
    id: SyncJobOperation.getBullJobId(jobDxid),
    endDate: null,
    tz: null,
    cron: '*/2 * * * *',
    every: null,
    next: Date.now() - 5 * 60 * 1000,
  }),
}

export {
  alert,
  app,
  appSeries,
  asset,
  bullQueue,
  bullQueueRepeatable,
  challenge,
  comment,
  comparison,
  dbCluster,
  expert,
  folder,
  job,
  news,
  note,
  random,
  space,
  spaceEvent,
  spaceMembership,
  tag,
  tagging,
  user,
  userFile,
  workflowSeries,
}
