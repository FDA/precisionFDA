import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Markdown from '../../Markdown'
import LinkTargetBlank from '../../LinkTargetBlank'
import './style.sass'


const HomeLicense = ({ license = {}, className, link }) => {
  const classes = classnames({
    'home-license': true,
  }, className)

  return (
    <div className={classes}>
      <div className='home-license__title'>
        <LinkTargetBlank url={link}>{license.title}</LinkTargetBlank>
      </div>
      <Markdown data={license.content} />
    </div>
  )
}

HomeLicense.propTypes = {
  className: PropTypes.string,
  license: PropTypes.object,
  link: PropTypes.string,
}

export default HomeLicense
