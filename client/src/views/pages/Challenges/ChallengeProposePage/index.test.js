import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { ChallengeProposePage } from '.'


const mockStore = configureMockStore()
const store = mockStore({})

describe('ChallengeProposePage test', () => {
  it('should render', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <ChallengeProposePage />
      </Provider>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
