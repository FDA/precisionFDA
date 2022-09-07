import React from 'react'
import { shallow } from 'enzyme'

import { NewsListItemSmall, NewsListItemLarge } from '.'
import { INewsItem } from '../../../../types/newsItem'


const getMockNewsItem = () => {
  const mockNewsItem: INewsItem = {
    id: 1,
    title: 'News Item 1',
    link: 'News Link 1',
    when: undefined,
    content: 'News Content',
    userId: 123,
    video: '',
    position: 1,
    published: true,
    createdAt: new Date('March 1, 2021 20:21:00'),
    updatedAt: new Date('March 1, 2021 20:21:00'),
  }
  return mockNewsItem
}

describe('NewsListItemSmall test', () => {
  it('should render', () => {
    const wrapper = shallow(<NewsListItemSmall newsItem={getMockNewsItem()} />)

    expect(wrapper).toMatchSnapshot()
  })
})

describe('NewsListItemLarge test', () => {
  it('should render', () => {
    const wrapper = shallow(<NewsListItemLarge newsItem={getMockNewsItem()} />)

    expect(wrapper).toMatchSnapshot()
  })
})
