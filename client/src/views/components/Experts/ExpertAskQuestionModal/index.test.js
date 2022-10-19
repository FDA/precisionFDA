import React from 'react'
import { shallow } from 'enzyme'

import { ExpertAskQuestionModal } from '.'


describe('ExpertAskQuestionModal test', () => {
  xit('should render', () => {
    const component = shallow(<ExpertAskQuestionModal />)

    expect(component).toMatchSnapshot()
  })
})
