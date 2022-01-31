import React from 'react'
import { Link } from 'react-router-dom'

import { IExpert } from '../../../../types/expert'
import './style.sass'


const ExpertBlogComponent = ({ expert, content }: { expert?: IExpert, content: JSX.Element } ) => {
  if (!expert || !expert.id) {
    return (
      <div className="error-container">
        <div className='text-left'>
          <Link to={{ pathname: '/experts' }}>
            &larr; Back to All Experts
          </Link>
        </div>
        <div className='text-center'>
          <span>Expert not found</span>
        </div>
      </div>
    )
  }
  const date = new Date(expert.createdAt)
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }

  return (
    <div className='expert-details__blog-content'>
      <div className='strong'>
        <h1>{expert.blogTitle}</h1>
      </div>
      <div className='expert-details__blog-content__prefname'>
        <p className='title'>{expert.title}</p>
        <p>{date.toLocaleDateString('default', dateOptions)}</p>
      </div>
      <div className='expert-details-content'>
        {content}
      </div>
      <div className="text-muted text-left">
        <hr/>
        The views expressed are those of the author(s) and should not be construed to represent views or policies held by
        the FDA.
      </div>
    </div>
  )
}

export const ExpertBlog = ExpertBlogComponent
