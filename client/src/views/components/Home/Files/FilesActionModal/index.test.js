import React from 'react'
import { shallow } from 'enzyme'

import { FilesActionModal } from '.'


describe('FilesActionModal test', () => {
  it('should render', () => {
    const component = shallow(<FilesActionModal />)

    expect(component).toMatchSnapshot()
  })
})
