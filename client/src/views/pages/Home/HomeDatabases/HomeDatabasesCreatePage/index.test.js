import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { HomeDatabasesCreatePage } from './index'


const mockStore = configureMockStore()
const store = mockStore({})

describe('HomeDatabasesCreatePage test', () => {
  it('should render', () => {
    const component = shallow(
      <Provider store={store}>
        <HomeDatabasesCreatePage />
      </Provider>,
    )
    expect(component).toMatchSnapshot()
  })
})