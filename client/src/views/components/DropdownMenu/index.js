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

const Item = ({ text, icon, isDisabled, onClick, link, method, hide }) => {
  if (hide) return null

  const classes = classNames({
    'dropdown-menu__item--disabled': isDisabled,
  }, 'dropdown-menu__item')

  const handler = () => {
    if (!isDisabled && typeof onClick === 'function') onClick()
  }

  if (link && !isDisabled) {
    return (
      <li className={classes}>
        <a style={{ padding: 0 }} href={link} data-method={method}>
          {icon && <Icon icon={icon} />}&nbsp;
          {text}
        </a>
      </li>
    )
  }

  return (
    <li className={classes} onClick={handler}>
      {icon && <Icon icon={icon} />}&nbsp;
      {text}
    </li>
  )
}

const DropdownMenu = ({ icon, title, options, className, message = '' }) => {
  const menuOptions = options ? options : tmpOptions

  const list = menuOptions.map((e) => {
    return <Item {...e} key={e.text} />
  })

  if (message) list.unshift(
    <React.Fragment key='message'>
      <li style={{ padding: '3px 20px', fontStyle: 'italic' }}>{message}</li>
      <li className='divider'></li>
    </React.Fragment>,
  )

  const classes = classNames('dropdown', className)

  return (
    <div className='btn-group'>
      <div className={classes}>
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
  link: PropTypes.string,
  method: PropTypes.string,
  hide: PropTypes.bool,
}

DropdownMenu.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  options: PropTypes.array,
  className: PropTypes.string,
  message: PropTypes.string,
}

export default DropdownMenu
