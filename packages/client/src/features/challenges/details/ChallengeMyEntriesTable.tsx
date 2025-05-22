import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import styled, { css } from 'styled-components'
import { Loader } from '../../../components/Loader'
import { SimpleTable } from '../../../components/SimpleTable'
import { IUser } from '../../../types/user'
import { StyledNameCell } from '../../home/home.styles'
import { StyledChallengeSubmissionsTable } from './styles'
import { SubmissionV2 } from './submission.types'
import { InputFileCell, NameCell } from './SubmissionTable'
import { useChallengeEntriesQuery } from './useChallengeEntriesQuery'

const StyledStateCell = styled.div<{ state: SubmissionV2['job']['state'] }>`
  color: var(--c-text-700);
  padding: 4px 15px;
  border-radius: 3px;
  width: fit-content;
  margin: 8px;

  ${({ state }) => {
    if (state === 'running' || state === 'idle') {
      return css`
        color: var(--primary-600);
        background-color: var(--primary-100);
        border: 1px solid var(--primary-300);
      `
    }
    if (state === 'done') {
      return css`
        color: var(--success-600);
        background-color: var(--success-100);
        border: 1px solid var(--success-300);
      `
    }
    if (state === 'failed' || state === 'terminated') {
      return css`
        color: var(--warning-600);
        background-color: var(--warning-100);
        border: 1px solid var(--warning-300);
      `
    }
    return css`
      color: var(--primary-600);
      background-color: var(--primary-100);
      border: 1px solid var(--primary-300);
    `
  }}
`

const StateCell = ({ jobState }: { jobState: SubmissionV2['job']['state'] }) => {
  let state = ''
  switch (jobState) {
    case 'done':
    case 'failed':
      state = jobState
      break
    case 'running':
      state = 'verifying...'
      break
    default:
      state = 'pending verification...'
  }
  return <StyledStateCell state={jobState}>{state}</StyledStateCell>
}

const Info = styled.div`
  margin-bottom: 32px;
`

export const useSubmissionTableColumns = ({
  isSpaceMember,
  authUser,
}: {
  isSpaceMember: boolean
  authUser: IUser
}): ColumnDef<SubmissionV2>[] => {
  return [
    {
      header: 'State',
      accessorKey: 'job.state',
      size: 100,
      cell: c => {
        return <StateCell jobState={c.row.original.job.state} />
      },
    },
    {
      header: 'Name',
      accessorKey: 'name',
      size: 450,
      cell: ({ cell }) => <NameCell submission={cell.row.original} />,
    },
    {
      header: 'Submitted By',
      accessorKey: 'user.dxuser',
      cell: c => (
        <StyledNameCell as="a" href={`/users/${c.row.original.user.dxuser}`}>
          {c.row.original.user.fullName}
        </StyledNameCell>
      ),
    },
    {
      header: 'Input File',
      accessorKey: 'job.inputFiles.id',
      size: 250,
      cell: ({ cell }) => <InputFileCell authUser={authUser} submission={cell.row.original} isSpaceMember={isSpaceMember} />,
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      size: 200,
    },
  ]
}

export const ChallengeMyEntriesTable = ({ challengeId, user, isSpaceMember }) => {
  const { data: submissionsData, isLoading } = useChallengeEntriesQuery(challengeId)
  const columns = useSubmissionTableColumns({ authUser: user, isSpaceMember })

  const isLoggedIn = !!user && Object.keys(user).length > 0
  if (!isLoggedIn) {
    return (
      <Info>
        In order to participate in this challenge, please{' '}
        <a data-turbolinks="false" href="/login">
          login
        </a>
        . If you don&apos;t have a PrecisionFDA account, please{' '}
        <a data-turbolinks="false" href="/request_access">
          submit an access request
        </a>{' '}
        to join and engage in the community!
      </Info>
    )
  }

  if (isLoading) return <Loader />

  if (!submissionsData || submissionsData.length === 0) {
    return <Info>No entries have been successfully submitted for this challenge.</Info>
  }

  return (
    <StyledChallengeSubmissionsTable>
      <SimpleTable data={submissionsData} columns={columns} />
    </StyledChallengeSubmissionsTable>
  )
}
