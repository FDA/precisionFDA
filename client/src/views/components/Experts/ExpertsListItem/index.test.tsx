import React from 'react'
import { shallow } from 'enzyme'

import { ExpertsListItemBlogEntry, ExpertsListItemBlogEntrySmall, ExpertsListItemQuestionsAndAnswers } from '.'
import { IExpert } from '../../../../types/expert'

describe('ExpertsListItem test', () => {
  const getMockExpert = () => {
    const i = 1
    const mockExpert: IExpert = {
      id: i,
      user_id: i,
      title: 'Experts '+i,
      blogTitle: 'Blog Title '+i,
      blogPreview: 'Blog Preview '+i,
      blog: 'Blog '+i,
      about: '',
      image: '',
      state: 'open',
      scope: 'public',
      createdAt: new Date('March 1, 2021 20:21:00'),
      updatedAt: new Date('March 1, 2021 20:21:00'),
      totalAnswerCount: 10,
      totalCommentCount: 11,
    }
    return mockExpert
  }

  it('should render ExpertsListItemBlogEntry', () => {
    const mockExpert = getMockExpert()
    const wrapper = shallow(<ExpertsListItemBlogEntry expert={mockExpert} userCanEdit={false} />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should render ExpertsListItemBlogEntrySmall', () => {
    const mockExpert = getMockExpert()
    const wrapper = shallow(<ExpertsListItemBlogEntrySmall expert={mockExpert} userCanEdit={false} />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should render ExpertsListItemQuestionsAndAnswers', () => {
    const mockExpert = getMockExpert()
    const wrapper = shallow(<ExpertsListItemQuestionsAndAnswers expert={mockExpert} userCanEdit={false} />)

    expect(wrapper).toMatchSnapshot()
  })

})
