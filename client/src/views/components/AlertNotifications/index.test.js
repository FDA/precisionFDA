import React from 'react'
import { shallow } from 'enzyme'

import { AlertNotifications } from '.'


describe('AlertNotifications test', () => {
  it('should render', () => {
    const component = shallow(<AlertNotifications messages={[]} />)

    expect(component).toMatchSnapshot()
  })
})
