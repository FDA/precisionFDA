import React from 'react'
import { shallow } from 'enzyme'

import { NewsListPage } from '.'

import NewsList from '../../../components/News/NewsList'


describe('NewsListPage test', () => {
  it('should render', () => {
    const wrapper = shallow(<NewsListPage />)
    expect(wrapper).toMatchSnapshot()
  })

  it('should contain NewsList', () => {
    const wrapper = shallow(<NewsListPage />)
    // console.log(wrapper.debug());
    expect(wrapper.find(NewsList)).toHaveLength(1)
  })
})
