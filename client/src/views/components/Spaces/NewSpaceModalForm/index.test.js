import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { NewSpaceModalForm } from './index'


const mockStore = configureMockStore()
const store = mockStore({})

describe('<NewSpaceModalForm/>', () => {
  it('should render', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <NewSpaceModalForm onCancelClick={() => {}} onCreateClick={() => {}} />
      </Provider>,
    )

    expect(wrapper).toMatchSnapshot()
  })
})
