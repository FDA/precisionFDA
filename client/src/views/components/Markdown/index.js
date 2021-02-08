import React from 'react'
import { Remarkable } from 'remarkable'
import { linkify } from 'remarkable/linkify'
import PropTypes from 'prop-types'


const Markdown = ({ data = '', ...rest }) => {
  const md = new Remarkable('full', {
    typographer: true,
  }).use(linkify)

  return <div dangerouslySetInnerHTML={{ __html: md.render(data) }} {...rest}></div>
}

Markdown.propTypes = {
  data: PropTypes.string,
}

export default Markdown
