import React, { useMemo } from 'react'
import { useQueryClient } from 'react-query'
import { useLocation } from 'react-router-dom'
import { Column } from 'react-table'
import ReactTooltip from 'react-tooltip'
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

const markIncompleteFile = (file: IFile) =>
  file.state === 'open' || file.state === 'closing'

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
          Cell: ({ cell, value }) => (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {cell.row.original.type === 'UserFile' || cell.row.original.type === 'File' ? (
                <>
                  <StyledNameCell
                    data-tip
                    data-for={`fileNameTooltip${cell.row.original.uid}`}
                    color={
                      markIncompleteFile(cell.row.original)
                        ? colors.stateLabelGrey
                        : colors.primaryBlue
                    }
                    onClick={() => onFileClick(cell.row.original.uid)}
                  >
                    <FileIcon height={14} />
                    {value}
                  </StyledNameCell>
                  {markIncompleteFile(cell.row.original) && (
                    <ReactTooltip
                      id={`fileNameTooltip${cell.row.original.uid}`}
                      place="top"
                      effect="solid"
                    >
                      File is in {cell.row.original.state} state.
                    </ReactTooltip>
                  )}
                </>
              ) : (
                <StyledNameCell
                  onClick={() => onFolderClick(cell.row.original.id.toString())}
                >
                  <FolderIcon height={14} />
                  {value}
                </StyledNameCell>
              )}
            </>
          ),
        },
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
            <a href={cell.row.original.links.user || ''}>{value}</a>
          ),
        },
        {
          Header: 'Size',
          accessor: 'file_size',
          Filter: NumberRangeColumnFilter,
          width: colWidths?.file_size || 160,
          filterPlaceholderFrom: `Min(Kb)`,
          filterPlaceholderTo: `Max(Kb)`,
        },
        {
          Header: 'Created',
          accessor: 'created_at_date_time',
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
                  row.original.links.origin_object?.origin_type ===
                    'Job' && (
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
