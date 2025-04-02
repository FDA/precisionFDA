import { Cell } from '@tanstack/react-table'
import React from 'react'
import { Link } from 'react-router-dom'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { RESOURCE_LABELS } from '../../types/user'
import { StyledNameCell } from '../home/home.styles'
import { IExecution, Job } from './executions.types'
import { StateCell } from './StateCell'
import { BoltIcon } from '../../components/icons/BoltIcon'

export const getSubComponentValue = (job: Job, cell: Cell<IExecution, any>) => {
  let val

  if (cell.column.id === 'state') {
    val = <StateCell state={job.state} />
  }
  if (cell.column.id === 'instance_type') val = RESOURCE_LABELS[job.instance_type] ?? job.instance_type
  if (cell.column.id === 'name') {
    val = (
      <StyledNameCell as={Link} to={`/home/executions/${job.uid}`}>
        <BoltIcon height={14} /> {job.name}
      </StyledNameCell>
    )
  }
  if (cell.column.id === 'app_title' && job.links.app) {
    val = (
      <StyledNameCell as={Link} to={`/home${job.links.app}`}>
        <CubeIcon height={14} /> {job.app_title}
      </StyledNameCell>
    )
  }
  if (cell.column.id === 'launched_on') {
    val = job.created_at_date_time
  }
  return (

      <td>{val}</td>
  )
}

