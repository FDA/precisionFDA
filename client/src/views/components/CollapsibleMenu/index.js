import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'
import styled from 'styled-components'
import Icon from '../Icon'
import { colors } from '../../../styles/theme'

const StyledMenu = styled.div`
.collapsible-menu {
  .title {
    display: inline-block;
    letter-spacing: 0;

    a {
      color: ${colors.textMediumGrey};

      &:hover {
        color: ${colors.textDarkGrey};
      }
    }
  }
}
.collapsible-header {
  .title {
    letter-spacing: 0;

    &:hover {
      color: ${colors.textDarkGrey};
      cursor: pointer;
    }
  }
  #toggle-icon {
    cursor: pointer;
    margin-right: 6px;
    transition: all 0.5s;

    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    transform: rotate(0deg);

    &.collapsed {
      -webkit-transform: rotate(180deg);
      -moz-transform: rotate(180deg);
      transform: rotate(180deg);
    }
  }
}
.collapsible-menu__item {
  display: block;
  padding-left: 16px;

  &--disabled {
    color: #888;
  }
  a {
    color: ${colors.textMediumGrey};

    &:hover {
      color: ${colors.textDarkGrey};
    }
  }
}
`


// Usage: either set the 'children' or the 'options' property
//        if both are set children takes precedent
//        In options dict, either use onClick and target for the links
//
//        If titleAnchor is defined, a HashLink is displayed using that anchor
//        If not, title is used

const exampleOptions = [
  {
    text: 'action1',
    isDisabled: false,
    onClick: () => console.log('action1 click'),
  },
  {
    text: 'action2',
    target: '/some/url',
    isDisabled: false,
  },
  {
    text: 'action3',
    isDisabled: false,
  },
  {
    text: 'action4',
    isDisabled: false,
  },
  {
    text: 'action5',
    isDisabled: false,
  },
]

const Item = ({ text, isDisabled, target, onClick, entityType }) => {
  const classes = classNames({
    'collapsible-menu__item--disabled': isDisabled,
  }, 'collapsible-menu__item')

  const handler = () => {
    if (!isDisabled && typeof onClick === 'function') onClick()
  }

  return (
    <div className={classes} onClick={handler}>
      { target ? <Link to={target} aria-label={`Click to view ${text} ${entityType}`}>{text}</Link> : <a aria-label={`Click to view ${text} ${entityType}`}>{text}</a> }
    </div>
  )
}


const CollapsibleMenu = ({ title, titleAnchor, children, options }) => {
  const menuOptions = options ? options : exampleOptions

  const generateList = () => { return menuOptions.map((e) => {
    return <Item {...e} key={e.text} onClick={e.onClick} entityType={e.entityType}/>
  })}

  const menuId = self.crypto.randomUUID()
  const collapseMenuId = 'collapseMenu'+menuId+title
  const collapseBodyId = 'collapseBody'+menuId+title

  return (
    <StyledMenu>
    <div className="accordion collapsible-menu" id={collapseMenuId}>
      {titleAnchor ? (
      <div className="accordion-header collapsible-header">
        <div style={{ display: 'flex' }}>
          <div style={{ flex: '0 0 16px', marginTop: '12px' }}>
            <Icon id='toggle-icon' icon='fa-angle-down' data-toggle="collapse" data-target={'#'+collapseBodyId} aria-controls={collapseBodyId} />
          </div>
          <div className='title'>
            <HashLink smooth to={titleAnchor} aria-label={`Navigates to ${title} component`}>{title}</HashLink>
          </div>
        </div>
      </div>
      ) : (
      <div className="accordion-header collapsible-header" data-toggle="collapse" data-target={'#'+collapseBodyId} aria-controls={collapseBodyId}>
        <Icon id='toggle-icon' icon='fa-angle-down' />
        <div className='title' aria-label={`Navigate to ${title} section`} >{title}</div>
      </div>
      )}
      <div id={collapseBodyId} className="accordion-collapse collapse in" aria-label="Collapsible menu heading" data-parent={'#'+collapseMenuId}>
        {children ? children : generateList()}
      </div>
    </div>
    </StyledMenu>
  )
}

Item.propTypes = {
  text: PropTypes.string,
  title: PropTypes.string,
  target: PropTypes.string,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  entityType: PropTypes.string,
}

CollapsibleMenu.propTypes = {
  title: PropTypes.string,
  titleAnchor: PropTypes.string,
  options: PropTypes.array,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
}

export default CollapsibleMenu
