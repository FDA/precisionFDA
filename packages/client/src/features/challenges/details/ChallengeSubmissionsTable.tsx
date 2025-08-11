import React, { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Loader } from '../../../components/Loader'
import { ChallengeEntriesTable } from '../../../components/ChallengeEntriesTable'
import { IUser } from '../../../types/user'
import { StyledNameCell } from '../../home/home.styles'
import { SubmissionV2 } from './submission.types'
import { InputFileCell, NameCell } from './SubmissionTable'
import { useChallengeSubmissionQuery } from './useChallengeSubmissionQuery'
import { formatDate } from '../../../utils/formatting'

export const useSubmissionTableColumns = ({
  isSpaceMember,
  authUser,
}: {
  isSpaceMember: boolean
  authUser: IUser
}): ColumnDef<SubmissionV2>[] => {
  return [
    {
      header: 'Name',
      accessorKey: 'name',
      size: 450,
      cell: c => <NameCell submission={c.row.original} />,
    },
    {
      header: 'Submitted By',
      accessorKey: 'user.dxuser',
      cell: c => (
        <StyledNameCell as="a" href={`/users/${c.row.original.user.dxuser}`}>
          {`${c.row.original.user.dxuser}`}
        </StyledNameCell>
      ),
    },
    {
      header: 'Input File',
      accessorKey: 'job_input_files',
      cell: ({ cell }) => <InputFileCell authUser={authUser} submission={cell.row.original} isSpaceMember={isSpaceMember} />,
      enableSorting: false,
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ cell }) => formatDate(cell.row.original.createdAt),
      size: 200,
    },
  ]
}

export const ChallengeSubmissionsTable = ({
  challengeId,
  user,
  isSpaceMember,
}: {
  challengeId: number
  user: IUser
  isSpaceMember: boolean
}) => {
  const { data: submissionsData, isLoading } = useChallengeSubmissionQuery(challengeId)

  const columns = useSubmissionTableColumns({ authUser: user, isSpaceMember })

  const data = useMemo(() => submissionsData || [], [submissionsData])

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
    return <div>There are no submissions for this challenge yet.</div>
  }

  return <ChallengeEntriesTable data={data} columns={columns} />
}
