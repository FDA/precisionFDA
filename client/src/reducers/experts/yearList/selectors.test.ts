import * as S from './selectors'
import { mockStore } from '../../../../test/helper'
import reducer from '../../index'

describe('selectors', () => {
  const items = [ 2010, 2011 ]
  const state = {
    experts: {
      yearList: {
        yearList: items,
      }
    }
  }

  it('expertsYearListSelector()', () => {
    expect(S.expertsYearListSelector(state)).toEqual(items)
  })
})
