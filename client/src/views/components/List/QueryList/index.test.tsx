import React from 'react'
import { shallow, mount } from 'enzyme'

import Loader from '../../Loader'
import { QueryList } from '.'


describe('QueryList test', () => {
  it('should render', () => {
    const wrapper = shallow(<QueryList />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should show loader when isFetching and not show QueryList', () => {
    const wrapper = mount(<QueryList isFetching={true} />)

    expect(wrapper.find(Loader)).toHaveLength(1)
  })

  it('should not show loader when not fetching and show QueryList with no rows', () => {
    const wrapper = mount(<QueryList items={[]} isFetching={false} />)
    // console.log(wrapper.debug())

    expect(wrapper.find(Loader)).toHaveLength(0)
    expect(wrapper.find('ul')).toHaveLength(0)
    expect(wrapper.find('li')).toHaveLength(0)
  })
})
