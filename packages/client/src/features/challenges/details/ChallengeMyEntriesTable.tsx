import React, { useMemo } from 'react'
import { Column } from 'react-table'
import styled, { css } from 'styled-components'
import { Loader } from '../../../components/Loader'
import { SimpleTable } from '../../../components/SimpleTable'
import { colors } from '../../../styles/theme'
import { IUser } from '../../../types/user'
import { StyledNameCell } from '../../home/home.styles'
import { StyledChallengeSubmissionsTable } from './styles'
import { Submission } from './submission.types'
import { InputFileCell, NameCell } from './SubmissionTable'
import { useChallengeEntriesQuery } from './useChallengeEntriesQuery'

const StyledStateCell = styled.div<{state: Submission['job_state']}>`
  color: ${colors.textDarkGrey};
  padding: 4px 15px;
  border-radius: 3px;
  width: fit-content;
  margin-left: 15px;

  ${({ state }) => {
    if(state === 'running' || state === 'idle') {
      return css`
        color: ${colors.primaryBlue};
        background-color: #f0f9fd;
      `
    }
    if(state === 'done') {
      return css`
        color: #3c763d;
        background-color: #dff0d8;
      `
    }
    if(state === 'failed' || state === 'terminated') {
      return css`
        color: #821a1d;
        background-color: #ffeeed;
      `
    }
    return css`
      color: ${colors.primaryBlue};
      background-color: #f0f9fd;
    `
  }}
`

const StateCell = ({ jobState }: { jobState: Submission['job_state'] }) => {
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
}) => {
  return useMemo<Column<Submission>[]>(
    () =>
      [
        {
          Header: 'State',
          accessor: 'job_state',
          minWidth: 100,
          className: 'state-cell',
          Cell: ({ cell, value }) => {
            return <StateCell jobState={value} />
          },
        },
        {
          Header: 'Name',
          accessor: 'name',
          minWidth: 450,
          Cell: ({ cell }) => <NameCell submission={cell.row.original} />,
        },
        {
          Header: 'Submitted By',
          accessor: 'user',
          Cell: ({ cell, value }) => (
            <StyledNameCell
              as="a"
              href={`/users/${cell.row.original.user.dxuser}`}
            >
              {`${value.first_name} ${value.last_name}`}
            </StyledNameCell>
          ),
        },
        {
          Header: 'Input File',
          accessor: 'job_input_files',
          minWidth: 250,
          Cell: ({ cell }) => (
            <InputFileCell
              authUser={authUser}
              submission={cell.row.original}
              isSpaceMember={isSpaceMember}
            />
          ),
        },
        {
          Header: 'Created',
          accessor: 'created_at',
          minWidth: 200,
        },
      ] as Column<Submission>[],
    [],
  )
}

export const ChallengeMyEntriesTable = ({
  challengeId,
  user,
  isSpaceMember,
}: any) => {
  const { data: submissionsData, isLoading } = useChallengeEntriesQuery(challengeId)

  const columns = useSubmissionTableColumns({ authUser: user, isSpaceMember })

  const data = useMemo(
    () => submissionsData?.submissions || [],
    [submissionsData?.submissions],
  )

  const isLoggedIn = user && Object.keys(user).length > 0
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

  if (!data || data.length === 0) {
    return (
      <Info>No entries have been successfully submitted for this challenge.</Info>
    )
  }

  return (
    <StyledChallengeSubmissionsTable>
      <SimpleTable data={data} columns={columns} />
    </StyledChallengeSubmissionsTable>
  )
}
