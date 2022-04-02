import React from 'react'
import { shallow } from 'enzyme'
import configureMockStore from 'redux-mock-store'

import AboutPage from '.'
import { Provider } from 'react-redux'

const mockStore = configureMockStore()
const store = mockStore({})

describe('AboutPage test', () => {
  it('should render', () => {
    const component = shallow(<Provider store={store}><AboutPage /></Provider>)
    expect(component).toMatchSnapshot()
  })
})
