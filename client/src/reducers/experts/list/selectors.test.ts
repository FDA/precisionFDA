import * as S from './selectors'
import reducer from '../../index'
import { mockStore } from '../../../../test/helper'

describe('selectors', () => {
  const items = [ "new 1", "new 2" ]
  const year = 2010
  const yearList = [2009, 2010]
  const pagination = 'pagination'
  const state = {
    experts: {
      list: {
        items,
        year,
        pagination
      },
      yearList: yearList,
    },
  }


  it('expertsListItemsSelector()', () => {
    expect(S.expertsListItemsSelector(state)).toEqual(items)
  })

  it('expertsListYearSelector()', () => {
    expect(S.expertsListYearSelector(state)).toEqual(year)
  })

  it('expertsListPaginationSelector()', () => {
    expect(S.expertsListPaginationSelector(state)).toEqual(pagination)
  })
})
