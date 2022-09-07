import React from 'react'
import { Link } from 'react-router-dom'
import { Cell } from 'react-table'
import { CogsIcon } from '../../../components/icons/Cogs'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { StyledNameCell } from '../home.styles'
import { IExecution, Job } from './executions.types'
import { getStateBgColorFromState } from './executions.util'

export const getSubComponentValue = (job: Job, cell: Cell<IExecution, any>) => {
  let backgroundColor = undefined
  let val = undefined
  if (cell.column.id === 'state') {
    backgroundColor = getStateBgColorFromState(job.state)
    val = job.state
  }
  if (cell.column.id === 'instance_type') val = job.instance_type
  if (cell.column.id === 'name') {
    val = (
      <StyledNameCell as={Link} to={`/home/executions/${job.uid}`}>
        <CogsIcon height={14} /> {job.name}
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
    <div
      className="td"
      {...cell.getCellProps()}
      style={{
        ...cell.getCellProps().style,
        backgroundColor,
      }}
    >
      {val}
    </div>
  )
}
