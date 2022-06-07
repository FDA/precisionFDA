import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { HomeDatabasesPage } from './index'


const mockStore = configureMockStore()
const store = mockStore({})

xdescribe('HomeDatabasesPage test', () => {
  it('should render', () => {
    const component = shallow(
      <Provider store={store}>
        <HomeDatabasesPage />
      </Provider>,
    )
    expect(component).toMatchSnapshot()
  })
})