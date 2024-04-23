import { IOType } from '@shared/types/common'
import type { JOB_STATE } from './job.enum'

interface IJobProperties {
  httpsAppState?: JOB_STATE
}

export interface IDns {
  url: string
}

export interface IHttpsApp {
  dns: IDns
}

export interface IRunInput {
  port: string
}

export interface IJobDescribe {
  id: string
  region: string
  name: string
  tags: string[]
  properties?: IJobProperties
  executable: string
  executableName: string
  class: 'job'
  created: number
  modified: number
  project: string
  billTo: string
  costLimit: number
  folder: string
  parentJob?: any
  originJob: string
  state: string
  workspace: string
  launchedBy: string
  priority: string
  singleContext: boolean
  app: string
  resource: string
  projectCache: string
  startedRunning: number
  stoppedRunning: number
  timeout: number
  totalPrice?: number
  httpsApp?: IHttpsApp
  failureMessage: string
  failureReason: string
  runInput: IRunInput
}

export interface JobRunData {
  output_folder_path?: string
  run_instance_type: string
  run_inputs: {
    [key: string]: IOType
  }
  run_outputs: {
    [key: string]: IOType
  }
}
