import { getSelectedTab, getWorkflowState } from './home'
import * as C from '../constants'


describe('Home helpers', () => {
  test('getSelectedTab test', () => {
    expect(getSelectedTab('Private', null)).toEqual(C.HOME_TABS.PRIVATE)
    expect(getSelectedTab('', 'link')).toEqual(C.HOME_TABS.SPACES)
    expect(getSelectedTab('Public', null)).toEqual(C.HOME_TABS.EVERYBODY)
    expect(getSelectedTab('Featured', null)).toEqual(C.HOME_TABS.FEATURED)
  })

  test('getWorkflowState test', () => {
    expect(getWorkflowState(['done', 'done', 'done', 'running'])).not.toBe('done')
    expect(getWorkflowState(['idle', 'running', 'running'])).toEqual('running')
    expect(getWorkflowState(['idle', 'idle','idle'])).toEqual('idle')
    expect(getWorkflowState(['idle', 'done','idle'])).not.toBe('idle')
    expect(getWorkflowState(['idle', 'runnable','idle'])).toEqual('runnable')
    expect(getWorkflowState(['idle', 'runnable','idle', 'done'])).toEqual('runnable')
    expect(getWorkflowState(['idle', 'runnable','idle', 'done', 'failed'])).not.toBe('runnable')
    expect(getWorkflowState(['idle', 'runnable', 'waiting_on_input', 'running'])).toEqual('running')
    expect(getWorkflowState(['idle', 'runnable', 'waiting_on_input', 'running', 'failed'])).not.toBe('running')
    expect(getWorkflowState(['done', 'terminating', 'done'])).toEqual('terminating')
    expect(getWorkflowState(['terminated', 'terminated'])).toEqual('terminated')
    expect(getWorkflowState(['done', 'terminated', 'done'])).toEqual('terminated')
    expect(getWorkflowState(['done', 'failed'])).toEqual('failed')
    expect(getWorkflowState(['done', 'idle'])).not.toBe('failed')
    expect(getWorkflowState(['done', 'done', 'done'])).toEqual('done')
    expect(getWorkflowState(['done', 'failed', 'done'])).toEqual('failed')
  })
})
