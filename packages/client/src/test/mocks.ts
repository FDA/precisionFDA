import { IExecution, Job } from '../features/executions/executions.types'
import { ConfidentialSpace, ISpace } from '../features/spaces/spaces.types'

export const createMockJob = (id: number, uid: string): Job => {
  return {
    id,
    uid,
    state: 'running',
    name: `name for ${id}`,
    appTitle: '',
    appRevision: 1,
    appActive: true,
    workflowTitle: 'workflow_title',
    workflowUid: 'workflow_uid',
    runInputData: [],
    runOutputData: [],
    runDataUpdates: {
      output_folder_path: '',
      run_instance_type: 'baseline-2',
      run_inputs: {},
      run_outputs: {},
    },
    instanceType: 'baseline-2',
    duration: '',
    durationInSeconds: 0,
    energyConsumption: '',
    failureReason: '',
    failureMessage: '',
    createdAt: '',
    createdAtDateTime: '',
    scope: '',
    location: '',
    launchedBy: 'user',
    launchedOn: '',
    featured: false,
    entityType: '',
    loggedDxuser: 'user',
    tags: [],
  }
}

export const createMockExecution = (id: number|string, uid: string): IExecution => {
  return {
    id,
    uid,
    state: 'running',
    httpsAppState: null,
    name: `Execution name ${uid}`,
    appRevision: 1,
    appActive: true,
    runInputData: [],
    runOutputData: [],
    createdAt: '',
    createdAtDateTime: '',
    appUid: '',
    energyConsumption: '1',
    costLimit: 0,
    duration: '1',
    durationInSeconds: 0,
    instanceType: 'baseline-2',
    launchedBy: 'user',
    launchedByDxuser: 'user',
    launchedOn: '',
    appTitle: 'app_title',
    location: 'location',
    dxid: '',
    workstationApiVersion: null,
    scope: 'public',
    featured: false,
    loggedDxuser: 'logged_dxuser',
    tags: [],
    properties: {},
    snapshot: false,
    entityType: 'regular',
    platformTags: [],
  }
}

export const createMockWorkflowExecution = (id: number|string, uid: string, numberOfJobs: number): IExecution => {
  const execution = createMockExecution(id, uid)
  execution.jobs = []
  for (let i = 0; i < numberOfJobs; i++) {
    const jobUid = `${uid}-job-${i}`
    const job = createMockJob(i, jobUid)
    execution.jobs.push(job)
  }
  return execution
}

export const createMockSpace = (): ISpace => {
  return {
    confidential_space: {} as ConfidentialSpace,
    protected: true,
    hidden: false,
    host_lead: {
      id: 1,
      dxuser: 'host_lead',
      user_url: 'host_lead_url',
      name: 'host_lead_name',
      org: 'host_lead_org',
      is_accepted: true,
    },
    guest_lead: {
      id: 2,
      dxuser: 'guest_lead',
      user_url: 'guest_lead_url',
      name: 'guest_lead_name',
      org: 'guest_lead_org',
      is_accepted: true,
    },
    id: 1,
    description: 'space test',
    state: 'active',
    name: 'space1',
    created_at: '12032022',
    updated_at: '12032022',
    space_create: '12032022',
    counters: { files: 1, apps: 1, workflows: 1, jobs: 1, members: 1, reports: 1, discussions: 1, dbclusters: 1 },
    links: { files: 'files', apps: 'apps', workflows: 'workflows', jobs: 'jobs', members: 'members' },
    updatable: true,
    tags: ['testing'],
    spaceId: 123,
    type: 'review',
    current_user_membership: {
      active: true,
      created_at: '2022-03-12T12:00:00.000Z',
      id: 1,
      meta: { },
      role: 'admin',
      side: 'host',
      updated_at: '2022-03-12T12:00:00.000Z',
      user_id: 1,
    },
  }
}
