import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { shallow, mount } from 'enzyme'

import Loader from '../../Loader'
import { ExpertsList } from '.'
import { ExpertsListItemBlogEntry } from '../ExpertsListItem'


const getMockExperts = () => {
  let mockExperts = []
  const dateNow = new Date()

  for (let i=0; i<10; i++) {
    mockExperts.push({
      id: i,
      user_id: i,
      state: 'open',
      scope: 'public',
      image: '',
      about: '',
      title: 'Expert '+i,
      blogTitle: 'Blog Title '+i,
      blogPreview: 'Blog Preview '+i,
      blog: 'Blog '+i,
      createdAt: dateNow,
      updatedAt: dateNow,
      totalAnswerCount: 10,
      totalCommentCount: 11,
    })
  }
  return mockExperts
}


describe('ExpertsList test', () => {
  it('should render', () => {
    const wrapper = shallow(<ExpertsList />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should show loader when isFetching and not show ExpertsList', () => {
    const wrapper = mount(<ExpertsList isFetching={true} listItemComponent={ExpertsListItemBlogEntry} />)

    // console.log(wrapper.debug())
    expect(wrapper.find(Loader)).toHaveLength(1)
    expect(wrapper.find('.experts-list')).toHaveLength(0)
    expect(wrapper.find('.experts-list-item')).toHaveLength(0)
  })

  it('should not show loader when not fetching and show ExpertsList with no rows', () => {
    const wrapper = mount(<ExpertsList experts={[]} isFetching={false} listItemComponent={ExpertsListItemBlogEntry} />)
    // console.log(wrapper.debug())

    expect(wrapper.find(Loader)).toHaveLength(0)
    expect(wrapper.find('div.text-center').text()).toEqual('No experts found.')
    expect(wrapper.find({ text: 'No experts found.'})).toHaveLength(0)
    expect(wrapper.find('ul')).toHaveLength(0)
    expect(wrapper.find('li')).toHaveLength(0)
  })

  it('should render 10 rows', () => {
    const mockExperts = getMockExperts()
    const mockPagination = {
      currentPage: 1,
      totalPages: 2,
      nextPage: 1,
      prevPage: 2,
      totalCount: 20,
    }
    const wrapper = mount (
      <BrowserRouter>
        <ExpertsList experts={mockExperts} pagination={mockPagination} isFetching={false} listItemComponent={ExpertsListItemBlogEntry} />
      </BrowserRouter>
    )
    // console.log(wrapper.debug())

    // Test items
    expect(wrapper.find('ul')).toHaveLength(1)
    expect(wrapper.find('.experts-list')).toHaveLength(1)
    expect(wrapper.find('.experts-list-item')).toHaveLength(10)

    // Test item props
    const items = wrapper.find(ExpertsListItemBlogEntry)
    expect(items).toHaveLength(10)
    expect(items.at(9).props().expert.id).toEqual(9)
    expect(items.at(8).props().expert.title).toEqual('Expert 8')
  })
})
