import React from 'react'
import { ExpertDetails } from '../types'

export const ExpertAbout = ({ expert }: { expert: ExpertDetails }) => (
  <div>
    <p>{expert.about}</p>
  </div>
)
