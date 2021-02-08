import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import Button from '../../../Button'
import Icon from '../../../Icon'
import './style.sass'


const Item = ({ uid, revision, isLatest, isCurrent }) => {
  const classes = classNames({
    'dropdown-menu__item': true,
    'dropdown-menu__item-current': isCurrent,
  })

  return (
    <li className={classes}>
      <Link to={`/home/apps/${uid}`}>
        <div>{revision}</div>
        {isLatest && <div className='revision-dropdown__latest'>Latest</div>}
      </Link>
    </li>
  )
}

const RevisionDropdown = ({ revisions = [], revision, className }) => {
  const lastRevision = revisions.length

  const list = revisions.map((e) => {
    const isLatest = e.revision === lastRevision
    const isCurrent = e.revision === revision
    return <Item {...e} key={e.id} isLatest={isLatest} isCurrent={isCurrent}/>
  })

  const classes = classNames('dropdown', 'revision-dropdown', className)

  const isLatest = revision === lastRevision

  return (
    <div className='btn-group'>
      <div className={classes}>
        <Button data-toggle='dropdown'>
          <>
            <Icon icon='fa-history' cssClasses='revision-dropdown__history-icon'/>&nbsp;
            <span className='revision-dropdown__label'>Revision: </span>
            <span className='revision-dropdown__value'>{revision}</span>
            {isLatest && <span className='revision-dropdown__latest'>Latest</span>}
            <span className='caret revision-dropdown__caret'></span>
          </>
        </Button>
        <ul className='dropdown-menu dropdown-menu-right revision-dropdown__options'>
          <li className='revision-dropdown__options_revisions'>Revisions</li>
          {list}
        </ul>
      </div>
    </div>
  )
}

Item.propTypes = {
  uid: PropTypes.string,
  isLatest: PropTypes.bool,
  revision: PropTypes.number,
  isCurrent: PropTypes.bool,
}

RevisionDropdown.propTypes = {
  revisions: PropTypes.array,
  revision: PropTypes.number,
  className: PropTypes.string,
}

export default RevisionDropdown
