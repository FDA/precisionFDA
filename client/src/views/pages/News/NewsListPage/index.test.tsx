import React from 'react'
import { shallow } from 'enzyme'

import { NewsListPage } from '.'

import NewsList from '../../../components/News/NewsList'


describe('NewsListPage test', () => {
  xit('should render', () => {
    const wrapper = shallow(<NewsListPage />)
    expect(wrapper).toMatchSnapshot()
  })

  xit('should contain NewsList', () => {
    const wrapper = shallow(<NewsListPage />)
    // console.log(wrapper.debug());
    expect(wrapper.find(NewsList)).toHaveLength(1)
  })
})
