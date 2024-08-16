import { DxId } from '@shared/domain/entity/domain/dxid'
import type { Uid } from '../../entity/domain/uid'
import type { JobInstanceType } from '../../job/job.enum'

export interface WorkflowSpec {
  input_spec: {
    stages: WorkflowInputSpecStage[]
  }
  output_spec: {
    stages: unknown[]
  }
}

interface WorkflowInputSpecStage {
  name: string
  prev_slot: DxId<'stage'>
  next_slot: DxId<'stage'>
  slotId: DxId<'stage'>
  app_dxid: DxId<'app'>
  app_uid: Uid<'app'>
  inputs: WorkflowSpecStageInputOutput[]
  outputs: WorkflowSpecStageInputOutput[]
  instanceType: JobInstanceType
  stageIndex: number
}

interface WorkflowSpecStageInputOutput {
  class: WorkflowInputSpecClassType
  label: string
  name: string
  optional: boolean
  parent_slot: DxId<'stage'>
  requiredRunInput: boolean
  stageName: string
  default_workflow_value: unknown
  values: WorkflowSpecStageInputOutputValue
}

interface WorkflowSpecStageInputOutputValue {
  id: DxId<'stage'>
  name: string
}

type WorkflowInputSpecClassType = 'string' | 'int' | 'file' | 'boolean' | 'float'
