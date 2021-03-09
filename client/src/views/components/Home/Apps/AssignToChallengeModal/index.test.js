import React from 'react'
import { shallow } from 'enzyme'

import { AssignToChallengeModal } from '.'


describe('AssignToChallengeModal test', () => {
  it('should render', () => {
    const component = shallow(<AssignToChallengeModal />)

    expect(component).toMatchSnapshot()
  })
})
