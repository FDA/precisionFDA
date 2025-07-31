import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { User, USER_STATE } from '../domain/user/user.entity'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { PROVISIONING_STATE } from '@shared/domain/invitation/invitation.enum'
import { Job } from '@shared/domain/job/job.entity'
import { JobRunData } from '@shared/domain/job/job.types'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { Note } from '@shared/domain/note/note.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Tag } from '@shared/domain/tag/tag.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { SyncFilesStateOperation } from '@shared/domain/user-file/ops/sync-files-state'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserExtras } from '@shared/domain/user/user-extras'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { JobInformation } from 'bull'
import Chance from 'chance'
import crypto from 'crypto'
import { DateTime } from 'luxon'
import { customAlphabet } from 'nanoid'
import { App, AppSpec, Internal } from '../domain/app/app.entity'
import { ENTITY_TYPE } from '../domain/app/app.enum'
import { CHALLENGE_STATUS } from '../domain/challenge/challenge.enum'
import { Comparison, COMPARISON_STATE } from '../domain/comparison/comparison.entity'
import {
  ENGINE as DB_CLUSTER_ENGINE,
  ENGINES,
  STATUS as DB_CLUSTER_STATUS,
} from '../domain/db-cluster/db-cluster.enum'
import { Expert, EXPERT_STATE } from '../domain/expert/expert.entity'
import { JOB_DB_ENTITY_TYPE, JOB_STATE } from '../domain/job/job.enum'
import {
  ENTITY_TYPE as SPACE_EVENT_ENTITY_TYPE,
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '../domain/space-event/space-event.enum'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '../domain/space-membership/space-membership.enum'
import { FILE_STATE_DX, FILE_STI_TYPE, PARENT_TYPE } from '../domain/user-file/user-file.types'
import { STATIC_SCOPE } from '../enums'
import { TASK_TYPE } from '../queue/task.input'
import type { AnyObject, UserCtx } from '../types'

const chance = new Chance()

const nanoidDxstr = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10)

const random = {
  firstName: (): string => chance.first(),
  lastName: (): string => chance.last(),
  email: (): string => chance.email(),
  password: (): string => crypto.randomBytes(64).toString('hex'),
  dxstr: (): string => nanoidDxstr(),
  word: (): string => chance.word(),
  description: (): string => chance.sentence({ words: 2 }),
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
    extras: new UserExtras(),
    privateFilesProject: `project-${random.dxstr()}`,
    publicFilesProject: `project-${random.dxstr()}`,
    privateComparisonsProject: `project-${random.dxstr()}`,
    publicComparisonsProject: `project-${random.dxstr()}`,
  }),
}

const alert = {
  active: (): {
    title: string
    content: string
    type: 'danger' | 'info' | 'warning'
    startTime: Date
    endTime: Date
  } => {
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
  expired: (): {
    title: string
    content: string
    type: 'danger' | 'info' | 'warning'
    startTime: Date
    endTime: Date
  } => {
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
  future: (): {
    title: string
    content: string
    type: 'danger' | 'info' | 'warning'
    startTime: Date
    endTime: Date
  } => {
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
  jupyterAppSpecData: (): AppSpec => {
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
  ttydAppSpecData: (): AppSpec => {
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
  ttydAppInternal: (): Internal => {
    return {
      ordered_assets: ['file-GQX1jP800Q42p0p3f2QY1zgb-1'],
      packages: ['ipython', 'pkg-config'],
    } as Internal
  },
  ttydAppInternalWithAPI: (version: string): Internal => {
    return {
      ordered_assets: ['file-GQX1jP800Q42p0p3f2QY1zgb-1'],
      platform_tags: [`pfda_workstation_api:${version}`],
      packages: ['ipython', 'pkg-config'],
    } as Internal
  },
  regular: (): Partial<InstanceType<typeof App>> => {
    const dxid = `app-${random.dxstr()}` as DxId<'app'>
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
    const dxid = `app-${random.dxstr()}` as DxId<'app'>
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
    const dxid = `app-${random.dxstr()}` as DxId<'app'>
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
  runTtydAppInput: (): AnyObject => ({
    scope: 'private',
    jobLimit: 50,
    input: {
      port: 8080,
    },
  }),
  runRshinyAppInput: (): AnyObject => ({
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
  appId: (): string => 'app-GP3J1V00XbPPz5qP4QPGxQ08',
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

const workflow = {
  simple: (): Partial<InstanceType<typeof Workflow>> => {
    const name = random.word()
    const dxid = `workflow-${random.dxstr()}}` as DxId<'workflow'>
    return {
      dxid,
      uid: `${dxid}-1` as Uid<'workflow'>,
      name,
      revision: 1,
      scope: 'private',
      spec: {
        input_spec: {
          stages: [],
        },
        output_spec: {
          stages: [],
        },
      },
    }
  },
}

const job = {
  simple: (app: App): Partial<InstanceType<typeof Job>> => {
    const dxid = `job-${random.dxstr()}` as DxId<'job'>
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
    const dxid = `job-${random.dxstr()}` as DxId<'job'>
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
  jobId: (): string => 'job-FyZg2z000B72xG6b3yVY5BBK',
}

const userFile = {
  simple: (customDxid?: string): Partial<InstanceType<typeof UserFile>> => {
    const dxid = (customDxid ?? `file-${random.dxstr()}`) as DxId<'file'>
    return {
      dxid,
      uid: `${dxid}-1` as Uid<'file'>,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      fileSize: random.chance.integer({ min: 100, max: 10_000_000 }),
      scope: STATIC_SCOPE.PRIVATE,
      state: FILE_STATE_DX.CLOSED,
      parentId: 1,
      parentType: PARENT_TYPE.JOB,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
  simpleUploaded: (customDxid?: string): Partial<InstanceType<typeof UserFile>> => {
    const dxid = (customDxid ?? `file-${random.dxstr()}`) as DxId<'file'>
    return {
      dxid,
      uid: `${dxid}-1` as Uid<'file'>,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      fileSize: random.chance.integer({ min: 100, max: 10_000_000 }),
      scope: STATIC_SCOPE.PRIVATE,
      state: FILE_STATE_DX.CLOSED,
      parentId: 1,
      parentType: PARENT_TYPE.USER,
      stiType: FILE_STI_TYPE.USERFILE,
    }
  },
  simpleJobOutput: (jobId: number, customDxid?: string): Partial<InstanceType<typeof UserFile>> => {
    const dxid = (customDxid ?? `file-${random.dxstr()}`) as DxId<'file'>
    return {
      dxid,
      uid: `${dxid}-1` as Uid<'file'>,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      fileSize: random.chance.integer({ min: 100, max: 10_000_000 }),
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
    const dxid = (customDxid ?? `file-${random.dxstr()}`) as DxId<'file'>
    return {
      dxid,
      uid: `${dxid}-1` as Uid<'file'>,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      fileSize: random.chance.integer({ min: 100, max: 10_000_000 }),
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
    const dxid = (customDxid ?? `file-${random.dxstr()}`) as DxId<'file'>
    return {
      dxid,
      uid: `${dxid}-1` as Uid<'file'>,
      project: `project-${random.dxstr()}`,
      name: chance.name(),
      fileSize: random.chance.integer({ min: 100, max: 10_000_000 }),
      scope: STATIC_SCOPE.PRIVATE,
      state: FILE_STATE_DX.CLOSED,
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
    taggableType: TAGGABLE_TYPE.NODE,
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
      cts: '',
    },
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
  projectId: (): string => `project-j47b1k3z8Jqqv001213v312j1`,
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
    const dxid = `dbcluster-${random.dxstr()}` as DxId<'dbcluster'>
    return {
      dxid: dxid,
      uid: `${dxid}-1` as Uid<'dbcluster'>,
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
      scope: STATIC_SCOPE.PUBLIC,
      state: EXPERT_STATE.OPEN,
      image: chance.url(),
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

const invitation = {
  simple: (): Partial<InstanceType<typeof Invitation>> => {
    return {
      firstName: random.firstName(),
      lastName: random.lastName(),
      email: random.email(),
      ip: chance.ip(),
      extras: {
        participate_intent: false,
        organize_intent: false,
        req_reason: 'Test',
        req_data: '',
        req_software: '',
        research_intent: false,
        clinical_intent: false,
        consistency_challenge_intent: '',
        truth_challenge_intent: '',
      },
      state: 'guest',
      code: chance.guid(),
      organizationAdmin: false,
      provisioningState: PROVISIONING_STATE.PENDING,
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
  syncDbClusterStatus: (
    dbClusterDxid: string,
    userContext: UserCtx,
  ): {
    data: { payload: { dxid: string }; type: TASK_TYPE; user: UserCtx }
  } => ({
    data: {
      payload: {
        dxid: dbClusterDxid,
      },
      type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
      user: userContext,
    },
  }),
  syncJobStatus: (
    jobDxid: string,
    userContext: UserCtx,
  ): {
    data: { payload: { dxid: string }; type: TASK_TYPE; user: UserCtx }
  } => ({
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
  syncFilesState: (dxuser: string): JobInformation => ({
    key: `__default__:${SyncFilesStateOperation.getBullJobId(dxuser)}:::*/2 * * * *`,
    name: '__default__',
    id: SyncFilesStateOperation.getBullJobId(dxuser),
    endDate: null,
    tz: null,
    cron: '*/2 * * * *',
    every: null,
    next: Date.now() + 60 * 1000,
  }),
  syncJobStatus: (jobDxid: string): JobInformation => ({
    key: `__default__:${JobSynchronizationService.getBullJobId(jobDxid)}:::*/2 * * * *`,
    name: '__default__',
    id: JobSynchronizationService.getBullJobId(jobDxid),
    endDate: null,
    tz: null,
    cron: '*/2 * * * *',
    every: null,
    next: Date.now() + 60 * 1000,
  }),
  // In orphaned cases the 'next' timestamp (in milliseconds) has passed and
  // they sit idle in BullQueue
  syncJobStatusOrphaned: (jobDxid): JobInformation => ({
    key: `__default__:${JobSynchronizationService.getBullJobId(jobDxid)}:::*/2 * * * *`,
    name: '__default__',
    id: JobSynchronizationService.getBullJobId(jobDxid),
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
  invitation,
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
  workflow,
  workflowSeries,
}
