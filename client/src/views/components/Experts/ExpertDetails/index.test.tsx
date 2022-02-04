import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { ExpertDetails } from '.'

const mockStore = configureMockStore()
const store = mockStore({})

describe('ExpertDetails test', () => {
  it('should render ExpertDetails', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <ExpertDetails expert={() => {}} />
      </Provider>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
