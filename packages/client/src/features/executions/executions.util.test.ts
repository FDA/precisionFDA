/**
 * @jest-environment node
 */

import { createMockExecution, createMockWorkflowExecution } from '../../test/mocks'
import { IExecution } from './executions.types'
import { getExecutionJobsList, isJobExecution, isWorkflowExecution } from './executions.util'


describe('isJobExecution()', () => {
  it('works', () => {
    expect(isJobExecution(createMockExecution('job-12345', 'job-12345-1'))).toBeTruthy()
    expect(isJobExecution(createMockExecution('workflow-12345', 'workflow-12345-1'))).toBeFalsy()
    expect(isJobExecution(createMockExecution('app-12345', 'app-12345-1'))).toBeFalsy()
    expect(isJobExecution(createMockExecution('file-12345', 'file-12345-1'))).toBeFalsy()
  })
})

describe('isWorkflowExecution()', () => {
  it('works', () => {
    expect(isWorkflowExecution(createMockExecution('job-12345', 'job-12345-1'))).toBeFalsy()
    expect(isWorkflowExecution(createMockExecution('workflow-12345', 'workflow-12345-1'))).toBeTruthy()
    expect(isWorkflowExecution(createMockExecution('app-12345', 'app-12345-1'))).toBeFalsy()
    expect(isWorkflowExecution(createMockExecution('file-12345', 'file-12345-1'))).toBeFalsy()
  })
})

describe('getExecutionJobsList()', () => {
  it('works on jobs only list', () => {
    const executions: IExecution[] = []
    for (let i=0; i<6; i++) {
      const execution = createMockExecution(`job-${i}`, `job-${i}-1`)
      executions.push(execution)
    }
    const jobs = getExecutionJobsList(executions)
    expect(jobs).toHaveLength(executions.length)
    expect(jobs[2]).toEqual('job-2-1')
    expect(jobs[4]).toEqual('job-4-1')
  })

  it('works on workflows only list', () => {
    const executions: IExecution[] = []
    for (let i=0; i<6; i++) {
      const execution = createMockWorkflowExecution(`workflow-${i}`, `workflow-${i}-1`, 2)
      executions.push(execution)
    }
    const jobs = getExecutionJobsList(executions)
    expect(jobs).toHaveLength(12)
    expect(jobs[2]).toEqual('workflow-1-1-job-0')
    expect(jobs[5]).toEqual('workflow-2-1-job-1')
  })

  it('works on mixed jobs and workflows list', () => {
    const executions: IExecution[] = [
      createMockExecution('job-1', 'job-1-1'),
      createMockWorkflowExecution('workflow-2', 'workflow-2-1', 2),
      createMockExecution('job-3', 'job-3-1'),
      createMockWorkflowExecution('workflow-4', 'workflow-4-1', 3),
      createMockExecution('job-5', 'job-5-1'),
    ]
    const jobs = getExecutionJobsList(executions)
    expect(jobs).toHaveLength(8)
    expect(jobs[0]).toEqual('job-1-1')
    expect(jobs[2]).toEqual('workflow-2-1-job-1')
    expect(jobs[6]).toEqual('workflow-4-1-job-2')
  })
})
