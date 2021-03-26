import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import Icon from '../Icon'
import './style.sass'


// Usage: either set the 'children' or the 'options' property
//        if both are set children takes precedent
//
// In options dict, either use onClick and target for the links

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

const Item = ({ text, isDisabled, target, onClick }) => {
  const classes = classNames({
    'collapsible-menu__item--disabled': isDisabled,
  }, 'collapsible-menu__item')

  const handler = () => {
    if (!isDisabled && typeof onClick === 'function') onClick()
  }

  return (
    <div className={classes} onClick={handler}>
      { target ? <Link to={target}>{text}</Link> : <a>{text}</a> }
    </div>
  )
}

const CollapsibleMenu = ({ title, children, options }) => {
  const menuOptions = options ? options : exampleOptions

  const generateList = () => { return menuOptions.map((e) => {
    return <Item {...e} key={e.text} onClick={e.onClick} />
  })}

  const menuId = uuidv4()
  const collapseMenuId = 'collapseMenu'+menuId
  const collapseBodyId = 'collapseBody'+menuId

  return (
    <div className="accordion collapsible-menu" id={collapseMenuId}>
      <div className="collapsible-header collapsed" data-toggle="collapse" data-target={'#'+collapseBodyId} aria-expanded="true" aria-controls={collapseBodyId}>
        <Icon id='toggle-icon' icon='fa-angle-down' />
        <div className='title'>{title}</div>&nbsp;
      </div>
      <div id={collapseBodyId} className="collapse" aria-labelledby="collapsibleMenuHeading" data-parent={'#'+collapseMenuId}>
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
}

CollapsibleMenu.propTypes = {
  title: PropTypes.string,
  options: PropTypes.array,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
}

export default CollapsibleMenu
