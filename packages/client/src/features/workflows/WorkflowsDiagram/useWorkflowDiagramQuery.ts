import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

interface Stage {
  name: string;
  prev_slot?: any;
  next_slot?: any;
  slotId: string;
  app_dxid: string;
  app_uid: string;
  inputs: any[];
  outputs: any[];
  instanceType: string;
  stageIndex: number;
}

interface Stages {
  [stage: number]: Stage[];
}

interface WorkflowDigramRespons {
  stages: Stages;
}

async function workflowDigramRequest(workflowId: string) {
  return axios.get(`/api/workflows/${workflowId}/diagram`).then(d => d.data.data as WorkflowDigramRespons)
}

export const useWorkflowDiagramQuery = (workflowId: string) => useQuery({
  queryKey: ['workflow-digram', workflowId],
  queryFn: () => workflowDigramRequest(workflowId),
})
