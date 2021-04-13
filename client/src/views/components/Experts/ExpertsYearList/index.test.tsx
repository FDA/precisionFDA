import React from 'react'
import { shallow } from 'enzyme'

import { ExpertsYearList } from '.'


describe('ExpertsYearList', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<ExpertsYearList setYearHandler={() => {}} />)

    expect(wrapper).toMatchSnapshot()
  })
})