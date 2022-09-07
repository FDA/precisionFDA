import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { ExpertBlog } from '.'

const mockStore = configureMockStore()
const store = mockStore({})

describe('ExpertDetails test', () => {
  it('should render ExpertDetails', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <ExpertBlog expert={() => {}} />
      </Provider>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
