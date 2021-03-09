import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './style.sass'


const Item = ({ elem, label }) => {
  const classes = classnames({
    'home-archive-contents-list__label': label,
  }, 'home-archive-contents-list__item')

  return (
    <li className={classes}>
      {elem}
    </li>
  )
}

const ArchiveContents = ({ className, data = []}) => {
  const classes = classnames({
    'home-archive-contents-list--empty': !data.length,
  },'home-archive-contents-list', className)

  if (!data.length) {
    return (
      <div className={classes} >
        No archive contents
      </div>
    )
  }


  const list = data.map((e, i) => <Item elem={e} key={i} />)

  return (
    <ul className={classes} >
      <Item elem='Files Only' label />
      {list}
    </ul>
  )
}

ArchiveContents.propTypes = {
  className: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.string),
}

Item.propTypes = {
  elem: PropTypes.string,
  label: PropTypes.bool,
}

export default ArchiveContents
