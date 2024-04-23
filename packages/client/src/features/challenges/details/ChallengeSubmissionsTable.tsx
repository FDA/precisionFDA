import React, { useMemo } from 'react'
import { Column } from 'react-table'
import { Loader } from '../../../components/Loader'
import { SimpleTable } from '../../../components/SimpleTable'
import { IUser } from '../../../types/user'
import { StyledNameCell } from '../../home/home.styles'
import { StyledChallengeSubmissionsTable } from './styles'
import { Submission } from './submission.types'
import { InputFileCell, NameCell } from './SubmissionTable'
import { useChallengeSubmissionQuery } from './useChallengeSubmissionQuery'

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

export const ChallengeSubmissionsTable = ({
  challengeId,
  user,
  isSpaceMember,
}: any) => {
  const { data: submissionsData, isLoading } =
    useChallengeSubmissionQuery(challengeId)

  const columns = useSubmissionTableColumns({ authUser: user, isSpaceMember })

  const data = useMemo(
    () => submissionsData?.submissions || [],
    [submissionsData?.submissions],
  )

  const isLoggedIn = user && Object.keys(user).length > 0
  if (!isLoggedIn) {
    return (
      <div>
        In order to participate in this challenge, please{' '}
        <a data-turbolinks="false" href="/login">
          login
        </a>
        . If you don't have a PrecisionFDA account, please{' '}
        <a data-turbolinks="false" href="/request_access">
          submit an access request
        </a>{' '}
        to join and engage in the community!
      </div>
    )
  }

  if (isLoading) return <Loader />

  if (!data || data.length === 0) {
    return (
      <div>There are no submissions for this challenge yet.</div>
    )
  }

  return (
    <StyledChallengeSubmissionsTable>
      <SimpleTable data={data} columns={columns} />
    </StyledChallengeSubmissionsTable>
  )
}
