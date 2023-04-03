import React, { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { Column } from 'react-table'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { FeaturedToggle } from '../../../components/FeaturedToggle'
import { AreaChartIcon } from '../../../components/icons/AreaChartIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import { TaskIcon } from '../../../components/icons/TaskIcon'
import {
  DefaultColumnFilter,
  NumberRangeColumnFilter,
  SelectColumnFilter,
} from '../../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { colors } from '../../../styles/theme'
import { StyledLinkCell, StyledNameCell } from '../home.styles'
import { KeyVal } from '../types'
import { IFile } from './files.types'
import { LockIcon } from '../../../components/icons/LockIcon'

const StyledLocked = styled.div<{ isLocked: boolean }>`
  flex: 1 0 auto;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  border-radius: 3px;
`

const isIncompleteFile = (state: IFile['state']) =>
  state === 'open' || state === 'closing' || state === 'removing'

export const useFilesColumns = ({
  isAdmin = false,
  onFileClick,
  onFolderClick,
  colWidths,
}: {
  onFileClick: (fileId: string) => void
  onFolderClick: (folderId: string) => void
  colWidths?: KeyVal
  isAdmin?: boolean
}) => {
  const location = useLocation()
  const queryClient = useQueryClient()

  return useMemo<Column<IFile>[]>(
    () =>
      [
        {
          Header: 'Name',
          accessor: 'name',
          Filter: DefaultColumnFilter,
          width: colWidths?.name || 400,
          styles: { display: 'relative' },
          Cell: ({ cell, value }) => {
            const node = cell.row.original
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                <StyledLocked isLocked={node.locked}>
                  {node.type === 'UserFile' || node.type === 'File' ? (
                    <>
                      <StyledNameCell
                        data-tip
                        data-for={`fileNameTooltip${node.uid}`}
                        color={
                          isIncompleteFile(node.state)
                            ? colors.stateLabelGrey
                            : colors.primaryBlue
                        }
                        onClick={() => onFileClick(node.uid)}
                      >
                        <FileIcon height={14} />
                        {node.locked && <LockIcon height={12} color={colors.darkYellow} />}

                        {value}
                      </StyledNameCell>
                      {isIncompleteFile(node.state) && (
                        <ReactTooltip
                          id={`fileNameTooltip${node.uid}`}
                          place="top"
                          effect="solid"
                        >
                          File is in {node.state} state.
                        </ReactTooltip>
                      )}
                    </>
                  ) : (
                    <StyledNameCell
                      onClick={() => onFolderClick(node.id.toString())}
                    >
                      <FolderIcon height={14} />
                      {node.locked && <LockIcon height={12} color={colors.darkYellow} />}
                      {value}
                    </StyledNameCell>
                  )}
                </StyledLocked>
              </>
            )
          },
        },
        // {
        //   Header: 'Locked',
        //   id: 'locked',
        //   accessor: 'locked',
        //   disableFilters: true,
        //   disableSortBy: true,
        //   width: 30,
        //   Cell: ({ row, value }) => row.original.locked && (<LockIcon />),
        // },
        {
          Header: 'Location',
          accessor: 'location',
          Filter: DefaultColumnFilter,
          width: colWidths?.location || 250,
          Cell: ({ row, value }) => (
            <StyledLinkCell to={`${row.original.links.space}/files`}>
              <ObjectGroupIcon />
              {value}
            </StyledLinkCell>
          ),
        },
        {
          Header: 'Featured',
          accessor: 'featured',
          disableSortBy: true,
          Filter: SelectColumnFilter,
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
          width: colWidths?.featured || 93,
          Cell: ({ cell }) => {
            const id =
              cell.row.original.type === 'Folder'
                ? cell.row.original.id
                : cell.row.original.uid
            return (
              <div style={{ paddingLeft: 20 }}>
                <FeaturedToggle
                  disabled={!isAdmin}
                  resource="files"
                  featured={cell.row.original.featured}
                  uids={[id]}
                  onSuccess={() => queryClient.invalidateQueries(['files'])}
                />
              </div>
            )
          },
        },
        {
          Header: 'Added By',
          accessor: 'added_by',
          Filter: DefaultColumnFilter,
          width: colWidths?.added_by || 198,
          Cell: ({ cell, value }) => (
            <a
              data-turbolinks="false"
              href={cell.row.original.links.user || ''}
            >
              {value}
            </a>
          ),
        },
        {
          Header: 'Size',
          accessor: 'file_size',
          Filter: NumberRangeColumnFilter,
          width: colWidths?.file_size || 160,
          filterPlaceholderFrom: 'min(kb)',
          filterPlaceholderTo: 'max(kb)',
        },
        {
          Header: 'Created',
          accessor: 'created_at_date_time',
          sortDescFirst: true,
          disableFilters: true,
          width: colWidths?.created_at_date_time || 200,
        },
        {
          Header: 'Origin',
          accessor: 'origin',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.origin || 240,
          Cell: ({ value, row }) => (
            <>
              {typeof value === 'object' &&
                row.original.links.origin_object?.origin_type === 'Job' && (
                  <StyledLinkCell
                    to={
                      `/home/executions/${row.original.links.origin_object?.origin_uid}` ||
                      '#'
                    }
                  >
                    <TaskIcon height={14} />
                    {value.text}
                  </StyledLinkCell>
                )}
              {typeof value === 'object' &&
                row.original.links.origin_object?.origin_type ===
                  'Comparison' && (
                  <StyledLinkCell to={`/home${value.href}` || '#'}>
                    <AreaChartIcon height={16} />
                    {value.text}
                  </StyledLinkCell>
                )}
              {typeof value === 'object' &&
                row.original.links.origin_object?.origin_type ===
                  'UserFile' && (
                  <StyledLinkCell
                    to={
                      `/home/files/${row.original.links.origin_object?.origin_uid}` ||
                      '#'
                    }
                  >
                    <FileIcon height={16} />
                    {value.text}
                  </StyledLinkCell>
                )}
              {typeof value === 'string' && value}
            </>
          ),
        },
        {
          Header: 'State',
          accessor: 'state',
          disableFilters: true,
          width: colWidths?.state || 120,
        },
        {
          Header: 'Tags',
          accessor: 'tags',
          Filter: DefaultColumnFilter,
          disableSortBy: true,
          width: colWidths?.tags || 500,
          Cell: ({ value }) => (
            <StyledTags>
              {value.map(tag => (
                <StyledTagItem key={tag}>{tag}</StyledTagItem>
              ))}
            </StyledTags>
          ),
        },
      ] as Column<IFile>[],
    [location.search],
  )
}
