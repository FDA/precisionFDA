import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { HomeDatabasesTable } from '.'


const mockStore = configureMockStore()
const store = mockStore({})

xdescribe('HomeDatabasesTable test', () => {
  it('should render', () => {
    const component = shallow(
      <Provider store={store}>
        <HomeDatabasesTable />
      </Provider>,
    )
    expect(component).toMatchSnapshot()
  })
})