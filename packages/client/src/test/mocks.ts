import { IExecution, Job } from '../features/executions/executions.types'
import { ConfidentialSpace, ISpace } from '../features/spaces/spaces.types'

export const createMockJob = (id: number, uid: string): Job => {
  return {
    id,
    uid,
    state: 'running',
    name: `name for ${id}`,
    app_title: '',
    app_revision: 1,
    app_active: true,
    workflow_title: 'workflow_title',
    workflow_uid: 'workflow_uid',
    run_input_data: [],
    run_output_data: [],
    run_data_updates: {
      run_instance_type: '',
      run_inputs: {},
      run_outputs: {},
    },
    instance_type: '',
    duration: '',
    duration_in_seconds: 0,
    energy_consumption: '',
    failure_reason: '',
    failure_message: '',
    created_at: '',
    created_at_date_time: '',
    scope: '',
    location: '',
    launched_by: 'user',
    launched_on: '',
    featured: false,
    links: {
      show: '',
      user: '',
      workflow: '',
      publish: '',
      log: '',
      track: '',
      attach_to: '',
      copy: '',
    },
    entity_type: '',
    logged_dxuser: 'user',
    tags: [],
  }
}

export const createMockExecution = (id: string, uid: string): IExecution => {
  return {
    id,
    uid,
    state: 'running',
    name: `Execution name ${uid}`,
    title: `Execution title ${uid}`,
    added_by: 'user',
    app_revision: '1',
    run_input_data: [],
    run_output_data: [],
    created_at: '',
    created_at_date_time: '',
    app_uid: '',
    energy_consumption: '1',
    duration: '1',
    instance_type: 'instance_type',
    launched_by: 'user',
    launched_on: '',
    app_title: 'app_title',
    location: 'location',
    revision: 1,
    readme: 'readme',
    workflow_series_id: 1,
    dxid: '',
    workstation_api_version: null,
    version: '1',
    scope: 'public',
    featured: false,
    active: true,
    logged_dxuser: 'logged_dxuser',
    links: {},
    tags: [],
  }
}

export const createMockWorkflowExecution = (id: string, uid: string, numberOfJobs: number): IExecution => {
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
    id: '1',
    description: 'space test',
    state: 'active',
    name: 'space1',
    created_at: '12032022',
    updated_at: '12032022',
    space_create: '12032022',
    counters: { files: 1, apps: 1, workflows: 1, jobs: 1, members: 1 },
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
