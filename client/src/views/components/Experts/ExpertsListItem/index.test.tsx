import React from 'react'
import { shallow } from 'enzyme'

import { ExpertsListItem, ExpertsListItemType } from '.'
import { IExpert } from '../../../shapes/ExpertShape'

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

  it('should render ExpertsListItemType.BlogEntry', () => {
    const mockExpert = getMockExpert()
    const wrapper = shallow(<ExpertsListItem expert={mockExpert} type={ExpertsListItemType.BlogEntry} userCanEdit={false} />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should render ExpertsListItemType.QuestionsAndAnswers', () => {
    const mockExpert = getMockExpert()
    const wrapper = shallow(<ExpertsListItem expert={mockExpert} type={ExpertsListItemType.QuestionsAndAnswers} userCanEdit={false} />)

    expect(wrapper).toMatchSnapshot()
  })

})
