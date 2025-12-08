import React from 'react'
import { generatePath, Navigate, NavigateProps, useParams } from 'react-router'

interface Props extends NavigateProps {
  to: string
}

const NavigateWithParams: React.FC<Props> = ({ to, ...props }) => {
  const params = useParams()

  return <Navigate {...props} to={generatePath(to, params)} />
}

export default NavigateWithParams
