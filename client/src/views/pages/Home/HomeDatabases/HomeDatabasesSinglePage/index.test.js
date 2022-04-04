import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { HomeDatabasesSinglePage }  from './index'


const mockStore = configureMockStore()
const store = mockStore({})

xdescribe('HomeDatabasesSinglePage test', () => {
  it('should render', () => {
    const component = shallow(
      <Provider store={store}>
        <HomeDatabasesSinglePage />
      </Provider>,
    )
    expect(component).toMatchSnapshot()
  })
})
