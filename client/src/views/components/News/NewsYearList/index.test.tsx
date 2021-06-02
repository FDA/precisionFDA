import React from 'react'
import { shallow } from 'enzyme'

import { NewsYearList } from '.'


describe('NewsYearList', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<NewsYearList setYearHandler={() => {}} />)

    expect(wrapper).toMatchSnapshot()
  })
})