import React from 'react'
import { shallow } from 'enzyme'

import { DatabasesActionModal } from '.'


describe('DatabasesActionModal test', () => {
  it('should render', () => {
    const component = shallow(<DatabasesActionModal />)

    expect(component).toMatchSnapshot()
  })
})
