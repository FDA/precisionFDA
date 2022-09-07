import React from 'react'
import { shallow, mount } from 'enzyme'
import { BrowserRouter as Router } from 'react-router-dom';

import Loader from '../../Loader'
import { NewsList } from '.'
import { NewsListItem, NewsListItemLarge } from '../NewsListItem'


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
    const wrapper = shallow(<Router><NewsList newsItems={[]} isFetching={false} listItemComponent={NewsListItemLarge} /></Router>)

    expect(wrapper).toMatchSnapshot()
  })

  it('should show loader when isFetching and not show NewsList', () => {
    const wrapper = mount(<Router><NewsList newsItems={[]} isFetching={true} listItemComponent={NewsListItemLarge} /></Router>)

    // console.log(wrapper.debug())
    expect(wrapper.find(Loader)).toHaveLength(1)
    expect(wrapper.find('.news-list')).toHaveLength(0)
    expect(wrapper.find('.news-list-item')).toHaveLength(0)
  })

  it('should not show loader when not fetching and show NewsList with no rows', () => {
    const wrapper = mount(<Router><NewsList newsItems={[]} isFetching={false} listItemComponent={NewsListItemLarge} /></Router>)
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
      totalPages: 3,
      nextPage: 2,
      prevPage: 1,
      totalCount: 25,
    }
    const wrapper = mount (
      <Router><NewsList newsItems={mockNews} pagination={mockPagination} isFetching={false} listItemComponent={NewsListItemLarge} /></Router>
    )
    // console.log(wrapper.debug())

    // Test items
    expect(wrapper.find('ul')).toHaveLength(1)
    expect(wrapper.find('.news-list')).toHaveLength(1)

    // Test item props
    const items = wrapper.find(NewsListItemLarge)
    expect(items).toHaveLength(10)
    expect(items.at(0)).toHaveProp('newsItem')
    // console.log(items.at(0).props())
    expect(items.at(9).props().newsItem.id).toEqual(9)
    expect(items.at(8).props().newsItem.title).toEqual('News Item 8')
  })
})
