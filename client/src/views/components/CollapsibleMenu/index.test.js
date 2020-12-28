import React from 'react'
import { shallow } from 'enzyme'

import CollapsibleMenu from './index'


describe('CollapsibleMenu', () => {
    it.skip('matches snapshot', () => {
      const wrapper = shallow(<CollapsibleMenu />)
  
      expect(wrapper).toMatchSnapshot()
    })
})