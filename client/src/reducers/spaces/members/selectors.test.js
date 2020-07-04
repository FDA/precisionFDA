import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const entries = ['workflow-1']
  const isFetching = true

  const state = reducer({
    spaces: {
      members: {
        entries,
        isFetching,
      },
    },
  }, { type: undefined })

  it('spaceWorkflowsListIsFetchingSelector()', () => {
    expect(S.spaceMembersListIsFetchingSelector(state)).toEqual(isFetching)
  })

  it('spaceAppsListSelector()', () => {
    expect(S.spaceMembersListSelector(state)).toEqual(entries)
  })
})
