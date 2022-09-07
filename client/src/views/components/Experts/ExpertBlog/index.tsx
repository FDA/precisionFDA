import React from 'react'
import { Link } from 'react-router-dom'

import { IExpert } from '../../../../types/expert'
import { format } from 'date-fns'
import './style.sass'

const ExpertBlogComponent = ({
  expert,
  content,
}: {
  expert?: IExpert
  content: JSX.Element
}) => {
  if (!expert || !expert.id) {
    return (
      <div className="error-container">
        <div className="text-left">
          <Link to={{ pathname: '/experts' }}>&larr; Back to All Experts</Link>
        </div>
        <div className="text-center">
          <span>Expert not found</span>
        </div>
      </div>
    )
  }

  return (
    <div className="expert-details__blog-content">
      <div className="strong">
        <h1>{expert.blogTitle}</h1>
      </div>
      <div className="expert-details__blog-content__prefname">
        <span className="expert-name">{expert.title}</span>
        <span className="expert-date">
          {format(expert.createdAt, 'MMM dd, yyyy')}
        </span>
      </div>
      <div className="expert-details-content">{content}</div>
      <div className="text-muted text-left">
        <hr />
        The views expressed are those of the author(s) and should not be
        construed to represent views or policies held by the FDA.
      </div>
    </div>
  )
}

export const ExpertBlog = ExpertBlogComponent
