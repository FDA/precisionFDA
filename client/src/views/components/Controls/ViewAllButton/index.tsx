import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { theme } from '../../../../styles/theme'


const StyledViewAllButtonContainer = styled.div`
  width: 192px;
  text-align: left;
  border-top: 1px solid ${theme.colors.highlightBlue};
  padding-top: 6px;
`

interface IViewAllButtonProps {
  title: string,
  url: string,
}

class ViewAllButton extends Component<IViewAllButtonProps> {
  render() {
    const { url, title } = this.props
    return (
      <StyledViewAllButtonContainer>
        <Link to={url}>{title}</Link>
      </StyledViewAllButtonContainer>
    )
  }
}

export {
  ViewAllButton,
}
