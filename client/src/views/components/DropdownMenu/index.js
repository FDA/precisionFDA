import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import Button from '../Button'
import Icon from '../Icon'


const tmpOptions = [
  {
    text: 'action1',
    isDisabled: false,
    onClick: () => console.log('action1 click'),
  },
  {
    text: 'action2',
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

const Item = ({ text, icon, isDisabled, onClick }) => {
  const classes = classNames({
    'dropdown-menu__item--disabled': isDisabled,
  }, 'dropdown-menu__item')

  const handler = () => {
    if (!isDisabled && typeof onClick === 'function') onClick()
  }

  return (
    <li className={classes} onClick={handler}>
      {icon && <Icon icon={icon} />}&nbsp;
      {text}
    </li>
  )
}

const DropdownMenu = ({ icon, title, options }) => {
  const menuOptions = options ? options : tmpOptions

  const list = menuOptions.map((e) => {
    return <Item {...e} key={e.text} onClick={e.onClick} />
  })

  return (
    <div className='btn-group'>
      <div className='dropdown'>
        <Button type='primary' data-toggle='dropdown'>
          <>
            {icon && <Icon icon={icon} />}&nbsp;
            <span>{title}</span>&nbsp;
            <Icon icon='fa-angle-down' />
          </>
        </Button>
        <ul className='dropdown-menu dropdown-menu-right'>
          {list}
        </ul>
      </div>
    </div>
  )
}

Item.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
}

DropdownMenu.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  options: PropTypes.array,
}

export default DropdownMenu