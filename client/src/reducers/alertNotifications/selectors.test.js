import { alertMessagesSelector } from './selectors'
import reducer from '../index'
import { mockStore } from '../../../test/helper'


describe('alertNotifications selectors', () => {
  const store = mockStore(reducer({}, { type: undefined }))

  it('listViewTypeSelector()', () => {
    expect(alertMessagesSelector(store.getState())).toEqual([])
  })
})
