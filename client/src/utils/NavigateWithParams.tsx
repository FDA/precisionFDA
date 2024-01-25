import React from 'react'
import { Navigate, NavigateProps, generatePath, useParams } from 'react-router-dom'

interface Props extends NavigateProps {
  to: string;
}

const NavigateWithParams: React.FC<Props> = ({ to, ...props }) => {
  const params = useParams()

  return <Navigate {...props} to={generatePath(to, params)} />
}

export default NavigateWithParams
