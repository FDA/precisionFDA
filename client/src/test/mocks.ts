import { IExecution, Job } from "../features/home/executions/executions.types"

export const createMockJob = (id: number, uid: string): Job => {
  return {
    id: id,
    uid: uid,
    state: 'running',
    name: `name for ${id}`,
    app_title: "",
    app_revision: 1,
    app_active: true,
    workflow_title: "workflow_title",
    workflow_uid: "workflow_uid",
    run_input_data: [],
    run_output_data: [],
    run_data_updates: {
      run_instance_type: "",
      run_inputs: {},
      run_outputs: {},
    },
    instance_type: "",
    duration: "",
    duration_in_seconds: 0,
    energy_consumption: "",
    failure_reason: "",
    failure_message: "",
    created_at: "",
    created_at_date_time: "",
    scope: "",
    location: "",
    launched_by: "user",
    launched_on: "",
    featured: false,
    links: {
      show: "",
      user: "",
      app: "",
      workflow: "",
      publish: "",
      log: "",
      track: "",
      attach_to: "",
      copy: "",
      run_job: "",
    },
    entity_type: "",
    logged_dxuser: "user",
    tags: [],
  }
}

export const createMockExecution = (id: string, uid: string): IExecution => {
  return {
    id: id,
    uid: uid,
    state: 'running',
    name: `Execution name ${uid}`,
    title: `Execution title ${uid}`,
    added_by: "user",
    app_revision: "1",
    run_input_data: [],
    run_output_data: [],
    created_at: "",
    created_at_date_time: "",
    energy_consumption: "1",
    duration: "1",
    instance_type: "instance_type",
    launched_by: "user",
    launched_on: "",
    app_title: "app_title",
    location: "location",
    revision: 1,
    readme: "readme",
    workflow_series_id: 1,
    version: "1",
    scope: "logged_dxuser",
    featured: false,
    active: true,
    logged_dxuser: "logged_dxuser",
    links: {},
    tags: [],
  }
}

export const createMockWorkflowExecution = (id: string, uid: string, numberOfJobs: number): IExecution => {
  const execution = createMockExecution(id, uid)
  execution.jobs = []
  for (let i=0; i<numberOfJobs; i++) {
    const jobUid = `${uid}-job-${i}`
    let job = createMockJob(i, jobUid)
    execution.jobs.push(job)
  }
  return execution
}
