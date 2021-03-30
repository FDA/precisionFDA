import React from 'react'
import { shallow } from 'enzyme'

import Loader from '../../Loader'
import { NewsList } from '.'
import { NewsListItem } from '../NewsListItem'


const getMockNews = () => {
  let mockNews = []
  const dateNow = new Date()

  for (let i=0; i<10; i++) {
    mockNews.push({
      id: i,
      title: 'News Item '+i,
      link: 'News Link '+i,
      when: undefined,
      content: 'News Content '+i,
      userId: 123,
      video: '',
      position: 1,
      published: true,
      createdAt: dateNow,
      updatedAt: dateNow,
    })
  }
  return mockNews
}


describe('NewsList test', () => {
  it('should render', () => {
    const wrapper = shallow(<NewsList />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should show loader when isFetching and not show NewsList', () => {
    const wrapper = mount(<NewsList isFetching={true} />)

    // console.log(wrapper.debug())
    expect(wrapper.find(Loader)).toHaveLength(1)
    expect(wrapper.find('.news-list')).toHaveLength(0)
    expect(wrapper.find('.news-list-item')).toHaveLength(0)
  })

  it('should not show loader when not fetching and show NewsList with no rows', () => {
    const wrapper = mount(<NewsList news={[]} isFetching={false} />)
    // console.log(wrapper.debug())

    expect(wrapper.find(Loader)).toHaveLength(0)
    expect(wrapper.find('div.text-center').text()).toEqual('No news found.')
    expect(wrapper.find({ text: 'No news found.'})).toHaveLength(0)
    expect(wrapper.find('ul')).toHaveLength(0)
    expect(wrapper.find('li')).toHaveLength(0)
  })

  it('should render 10 rows', () => {
    const mockNews = getMockNews()
    const mockPagination = {
      currentPage: 1,
      totalPages: 1
    }
    const wrapper = mount (
      <NewsList newsItems={mockNews} pagination={mockPagination} isFetching={false} />
    )
    // console.log(wrapper.debug())

    // Test items
    expect(wrapper.find('ul')).toHaveLength(1)
    expect(wrapper.find('.news-list')).toHaveLength(1)
    expect(wrapper.find('.news-list-item')).toHaveLength(10)

    // Test item props
    const items = wrapper.find(NewsListItem)
    expect(items).toHaveLength(10)
    expect(items.at(0)).toHaveProp('newsItem')
    // console.log(items.at(0).props())
    expect(items.at(9).props().newsItem.id).toEqual(9)
    expect(items.at(8).props().newsItem.title).toEqual('News Item 8')
  })
})
