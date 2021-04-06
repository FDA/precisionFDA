import React from 'react'
import reducer from '../../../../reducers'
import { shallow } from 'enzyme'

import { NewsYearList } from '.'


describe('NewsYearList', () => {
    it('matches snapshot', () => {
      const wrapper = shallow(<NewsYearList fetchYearList={() => {}} />)
  
      expect(wrapper).toMatchSnapshot()
    })
})