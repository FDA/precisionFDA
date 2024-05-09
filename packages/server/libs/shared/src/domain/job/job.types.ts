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
