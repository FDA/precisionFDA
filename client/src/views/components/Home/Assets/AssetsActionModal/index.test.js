import React from 'react'
import { shallow } from 'enzyme'

import { AssetsActionModal } from '.'


describe('AssetsActionModal test', () => {
  it('should render', () => {
    const component = shallow(<AssetsActionModal />)

    expect(component).toMatchSnapshot()
  })
})
