import React, { Component } from 'react'
import styled from 'styled-components'

import { commonStyles } from '../../../../styles/commonStyles'


const StyledSectionHeading = styled.div`
  ${commonStyles.sectionHeading};
`

class SectionHeading extends Component {
  render() {
    const { children } = this.props
    return (
      <StyledSectionHeading>
        {children}
      </StyledSectionHeading>
    )
  }
}

export {
  SectionHeading,
}
