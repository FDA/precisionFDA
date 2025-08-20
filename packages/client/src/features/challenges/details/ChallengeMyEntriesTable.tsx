import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { ChallengeEntriesTable } from '../../../components/ChallengeEntriesTable'
import { IUser } from '../../../types/user'
import { StyledNameCell } from '../../home/home.styles'
import { SubmissionV2 } from './submission.types'
import { InputFileCell, NameCell } from './SubmissionTable'
import { useChallengeEntriesQuery } from './useChallengeEntriesQuery'
import { StateCell } from '../../executions/StateCell'
import { formatDate } from '../../../utils/formatting'

const Info = styled.div`
  margin-bottom: 32px;
`

export const useSubmissionTableColumns = ({
  isSpaceMember,
  authUser,
}: {
  isSpaceMember: boolean
  authUser?: IUser
}): ColumnDef<SubmissionV2>[] => {
  return [
    {
      header: 'State',
      accessorKey: 'job.state',
      size: 100,
      cell: c => {
        return <StateCell state={c.row.original.job.state} />
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

export interface ChallengeMyEntriesTableProps {
  challengeId: string|number
  user?: IUser
  isSpaceMember: boolean
}

export const ChallengeMyEntriesTable = ({ challengeId, user, isSpaceMember }: ChallengeMyEntriesTableProps) => {
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

  return <ChallengeEntriesTable data={submissionsData} columns={columns} />
}
