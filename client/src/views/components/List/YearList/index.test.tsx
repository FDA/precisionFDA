import React from 'react'
import { shallow } from 'enzyme'

import { YearList } from '.'


describe('YearList', () => {
    it('matches snapshot', () => {
      const wrapper = shallow(<YearList setYearHandler={() => {}} />)
  
      expect(wrapper).toMatchSnapshot()
    })
})