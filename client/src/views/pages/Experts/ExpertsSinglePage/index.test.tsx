import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { ExpertsSinglePage } from '.'


const mockStore = configureMockStore()
const store = mockStore({})

describe('ExpertsSinglePage test', () => {
  it('should render', () => {
    const component = shallow(
      <Provider store={store}>
        <ExpertsSinglePage />
      </Provider>,
    )
    expect(component).toMatchSnapshot()
  })
})
