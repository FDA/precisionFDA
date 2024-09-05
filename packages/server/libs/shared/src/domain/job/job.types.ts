import { IOType } from '@shared/types/common'

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

export type JobLogItem = {
  timestamp: number
  source: string
  level: 'INFO' | 'STDOUT' | 'STDERR'
  job: `job-${string}`
  jobTry: number
  line: number
  msg: string
}
