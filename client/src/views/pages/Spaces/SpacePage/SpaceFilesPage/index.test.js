import React from 'react'
import { shallow } from 'enzyme'
import { BrowserRouter } from 'react-router-dom'

import { SpaceFilesPage } from '.'


describe('SpaceFilesPage test', () => {
  it('should render', () => {
    const space = { isPrivate: true }
    const component = shallow(
      <BrowserRouter>
        <SpaceFilesPage space={space} />
      </BrowserRouter>,
    )

    expect(component).toMatchSnapshot()
  })
})
