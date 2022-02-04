import React from 'react'
import { shallow } from 'enzyme'

import { ExpertAskQuestionModal } from '.'


describe('ExpertAskQuestionModal test', () => {
  it('should render', () => {
    const component = shallow(<ExpertAskQuestionModal />)

    expect(component).toMatchSnapshot()
  })
})
