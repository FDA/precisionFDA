import React from 'react'
import { Router, Route } from 'react-router-dom'
import { shallow } from 'enzyme'

import Loader from '../../Loader'
import { NewsListItem } from '.'
import { INewsItem } from '../../../shapes/NewsItemShape'

describe('NewsListItem test', () => {
  it('should render', () => {
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
    const wrapper = shallow(<NewsListItem newsItem={mockNewsItem} />)

    expect(wrapper).toMatchSnapshot()
  })
})
