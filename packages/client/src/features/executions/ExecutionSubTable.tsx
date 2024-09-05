import React from 'react'
import { Cell } from 'react-table'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { RESOURCE_LABELS } from '../../types/user'
import { IExecution, Job } from './executions.types'
import { CogsIcon } from '../../components/icons/Cogs'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { StyledNameCell } from '../home/home.styles'
import { StateCell } from './StateCell'

export const getSubComponentValue = (job: Job, cell: Cell<IExecution, any>) => {
  let val

  if (cell.column.id === 'state') {
    val = <StateCell state={job.state} />
  }
  if (cell.column.id === 'instance_type') val = RESOURCE_LABELS[job.instance_type] ?? job.instance_type
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
      }}
    >
      {val}
    </div>
  )
}


const SubTable = styled.div``

export const ExecutionSubTable = (row: any) =>
  row.original.jobs &&
  row.original.jobs.map((job: Job) => (
    <SubTable
      className="tr sub"
      {...row.getRowProps()}
      key={`${row.getRowProps().key}-sub-${job.id}`}
      style={row.getRowProps().style}
    >
      {row.cells.map((cell: Cell<IExecution, any>) => getSubComponentValue(job, cell))}
    </SubTable>
  ))
