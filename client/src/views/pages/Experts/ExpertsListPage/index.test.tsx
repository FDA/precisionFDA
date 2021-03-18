import React from 'react'
import { shallow } from 'enzyme'

import { ExpertsListPage } from '.'

import ExpertsList from '../../../components/Experts/ExpertsList'


describe('ExpertsListPage test', () => {
  it('should render', () => {
    const wrapper = shallow(<ExpertsListPage user={{}} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('should contain ExpertsList', () => {
    const wrapper = shallow(<ExpertsListPage user={{}} />)
    expect(wrapper.find(ExpertsList)).toHaveLength(2)
  })
})
