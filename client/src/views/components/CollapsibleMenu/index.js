import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'
import { v4 as uuidv4 } from 'uuid'

import Icon from '../Icon'
import './style.sass'


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

  const menuId = uuidv4()
  const collapseMenuId = 'collapseMenu'+menuId+title
  const collapseBodyId = 'collapseBody'+menuId+title

  return (
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
