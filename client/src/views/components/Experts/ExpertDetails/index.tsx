import React from 'react'
import { Link } from 'react-router-dom'

import { IExpert } from '../../../../types/expert'
import './style.sass'


const ExpertDetailsComponent = ({ expert }: { expert?: IExpert } ) => {
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

  return (
    <div className='expert-details-content'>
      <p>{expert.about}</p>
    </div>
  )
}

export const ExpertDetails = ExpertDetailsComponent
