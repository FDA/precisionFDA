import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Column } from 'react-table'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import { FeaturedToggle } from '../../components/FeaturedToggle'
import { CogsIcon } from '../../components/icons/Cogs'
import { DefaultColumnFilter, NumberRangeColumnFilter, SelectColumnFilter } from '../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { AreaChartIcon } from '../../components/icons/AreaChartIcon'
import { ClipboardCheckIcon } from '../../components/icons/ClipboardCheckIcon'
import { ClipboardIcon } from '../../components/icons/ClipboardIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { FolderIcon } from '../../components/icons/FolderIcon'
import { LockIcon } from '../../components/icons/LockIcon'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { colors } from '../../styles/theme'
import { StyledLinkCell, StyledNameCell } from '../home/home.styles'
import { KeyVal } from '../home/types'
import { IFile } from './files.types'

const StyledLocked = styled.div<{ $isLocked: boolean }>`
  flex: 1 0 auto;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  border-radius: 3px;
`

const isIncompleteFile = (state: IFile['state']) => state === 'open' || state === 'closing' || state === 'removing'

export const useFilesColumns = ({
  isAdmin = false,
  onFileClick,
  onFolderClick,
  colWidths,
  properties = [],
}: {
  onFileClick: (fileId: string) => void
  onFolderClick: (folderId: string) => void
  colWidths?: KeyVal
  isAdmin?: boolean
  properties?: string[]
  selectedFileIds?: any
}) => {
  const queryClient = useQueryClient()

  return [
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
            <StyledLocked $isLocked={node.locked}>
              {node.type === 'UserFile' || node.type === 'File' || node.type === 'Asset' ? (
                <>
                  <StyledNameCell
                    data-tooltip-id={`fileNameTooltip${node.uid}`}
                    data-tooltip-content={`File is in ${node.state} state.`}
                    color={
                      // TODO: Use css className or data attr
                      isIncompleteFile(node.state) ? 'var(--tertiary-600)' : 'var(--c-link)'
                    }
                    onClick={() => onFileClick(node.uid)}
                  >
                    <FileIcon height={14} />
                    {node.locked && <LockIcon height={12} color={colors.darkYellow} />}

                    {value}
                  </StyledNameCell>
                  {isIncompleteFile(node.state) && (
                    <Tooltip id={`fileNameTooltip${node.uid}`} style={{ zIndex: 2 }} />
                  )}
                </>
              ) : (
                <StyledNameCell onClick={() => onFolderClick(node.id.toString())}>
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
    {
      Header: 'ID',
      accessor: 'uid',
      disableSortBy: true,
      disableFilters: true,
      width: colWidths?.uid || 280,
      Cell: ({ cell }) => {
        const [isCopiedId, setIsCopiedId] = React.useState<boolean>(false)
        return (
          <div style={{}}>
            {cell.value?.length > 0 && (
              <StyledNameCell
                onClick={() => {
                  navigator.clipboard.writeText(cell.value)
                  setIsCopiedId(true)
                  setTimeout(() => setIsCopiedId(false), 5000)
                }}
              >
                {isCopiedId && <ClipboardCheckIcon height={14} />}
                {!isCopiedId && <ClipboardIcon height={14} />}
                <span>{cell.value}</span>
              </StyledNameCell>
            )}
          </div>
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
        const id = cell.row.original.type === 'Folder' ? cell.row.original.id : cell.row.original.uid
        return (
          <div style={{ paddingLeft: 20 }}>
            <FeaturedToggle
              disabled={!isAdmin}
              resource="files"
              featured={cell.row.original.featured}
              uids={[id]}
              onSuccess={() =>
                queryClient.invalidateQueries({
                  queryKey: ['files'],
                })
              }
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
        <a data-turbolinks="false" href={cell.row.original.links.user || ''}>
          {value}
        </a>
      ),
    },
    {
      Header: 'Size',
      accessor: 'file_size',
      Filter: NumberRangeColumnFilter,
      width: colWidths?.file_size || 160,
      filterPlaceholderFrom: 'Min(KB)',
      filterPlaceholderTo: 'Max(KB)',
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
          {typeof value === 'object' && row.original.links.origin_object?.origin_type === 'Job' && (
            <StyledLinkCell to={`${row.original.origin.href}` || '#'}>
              <CogsIcon height={14} />
              {value.text}
            </StyledLinkCell>
          )}
          {typeof value === 'object' && row.original.links.origin_object?.origin_type === 'Comparison' && (
            <StyledLinkCell to={`/home${value.href}` || '#'}>
              <AreaChartIcon height={16} />
              {value.text}
            </StyledLinkCell>
          )}
          {typeof value === 'object' && row.original.links.origin_object?.origin_type === 'UserFile' && (
            <StyledLinkCell to={`${row.original.origin.href}`}>
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
    ...properties.map(property => ({
      Header: property,
      accessor: (row: IFile) => row.properties[property],
      id: `props.${property}`,
      disableFilters: true,
      width: colWidths?.[property] || 200,
    })),
  ] as Column<IFile>[]
}
