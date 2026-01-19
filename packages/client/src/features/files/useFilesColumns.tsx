import { useQueryClient } from '@tanstack/react-query'
import { Column, ColumnDef, FilterFnOption } from '@tanstack/react-table'
import React from 'react'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import { FeaturedToggle } from '../../components/FeaturedToggle'
import { AreaChartIcon } from '../../components/icons/AreaChartIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { FileIcon } from '../../components/icons/FileIcon'
import { FolderIcon } from '../../components/icons/FolderIcon'
import { LockIcon } from '../../components/icons/LockIcon'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import NumberRangeFilter, { numberRangeFilterFn } from '../../components/Table/components/NumberRangeFilter'
import { propertiesColumnDef, selectColumnDef } from '../../components/Table/selectColumnDef'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { colors } from '../../styles/theme'
import { StyledLinkCell, StyledNameCell } from '../home/home.styles'
import { IFile } from './files.types'
import { CopyText } from '../../components/CopyText/CopyText'
import styles from './FileList.module.css'

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
  properties = [],
}: {
  onFileClick: (fileId: string) => void
  onFolderClick: (folderId: string) => void
  isAdmin?: boolean
  properties?: string[]
}): ColumnDef<IFile>[] => {
  const queryClient = useQueryClient()

  return [
    selectColumnDef<IFile>(),
    {
      header: 'Name',
      accessorKey: 'name',
      filterFn: 'includesString',
      size: 400,
      cell: ({ cell }) => {
        const node = cell.row.original
        return (
          <StyledLocked $isLocked={node.locked}>
            {node.type === 'UserFile' || node.type === 'File' || node.type === 'Asset' ? (
              <>
                <StyledNameCell
                  data-testid="file-row-name"
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

                  {node.name}
                </StyledNameCell>
                {isIncompleteFile(node.state) && <Tooltip id={`fileNameTooltip${node.uid}`} style={{ zIndex: 2 }} />}
              </>
            ) : (
              <StyledNameCell data-testid="folder-row-name" onClick={() => onFolderClick(node.id.toString())}>
                <FolderIcon height={14} />
                {node.locked && <LockIcon height={12} color={colors.darkYellow} />}
                {node.name}
              </StyledNameCell>
            )}
          </StyledLocked>
        )
      },
    },
    {
      header: 'ID',
      accessorKey: 'uid',
      enableSorting: false,
      enableColumnFilter: false,
      size: 280,
      cell: ({ row }) => {
        const node = row.original
        const val = node.type === 'Folder' ? node.id.toString() : node.uid
        return (
          <div style={{}}>
            {val && (
              <CopyText className={styles.copyVal} value={val}>
                <span>{val}</span>
              </CopyText>
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
      header: 'Location',
      accessorKey: 'location',
      filterFn: 'includesString',
      size: 250,
      cell: ({ row, getValue }) => (
        <StyledLinkCell to={`${row.original.links.space}/files`}>
          <ObjectGroupIcon />
          {getValue<string>()}
        </StyledLinkCell>
      ),
    },
    {
      header: 'Featured',
      accessorKey: 'featured',
      enableColumnFilter: false,
      size: 93,
      cell: ({ cell }) => {
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
      header: 'Added By',
      accessorKey: 'added_by',
      filterFn: 'includesString',
      size: 198,
      cell: ({ cell, getValue }) => (
        <a data-turbolinks="false" href={cell.row.original.links.user || ''}>
          {getValue<string>()}
        </a>
      ),
    },
    {
      header: 'Size',
      accessorKey: 'file_size',
      size: 160,
      filterFn: numberRangeFilterFn as FilterFnOption<IFile>,
      meta: {
        filterElement: (column: Column<IFile>) => (
          <NumberRangeFilter column={column} fromPlaceholder="Min (KB)" toPlaceholder="Max (KB)" />
        ),
      },
    },
    {
      header: 'Created',
      accessorKey: 'created_at_date_time',
      sortDescFirst: true,
      enableColumnFilter: false,
      size: 200,
    },
    {
      header: 'Origin',
      accessorKey: 'origin',
      enableColumnFilter: false,
      enableSorting: false,
      size: 240,
      cell: ({ row }) => {
        const value = row.original.origin
        return (
          <>
            {typeof value === 'object' && row.original.links.origin_object?.origin_type === 'Job' && (
              <StyledLinkCell to={`${value.href}` || '#'}>
                <CogsIcon height={14} />
                {value.text}
              </StyledLinkCell>
            )}
            {typeof value === 'object' && row.original.links.origin_object?.origin_type === 'Comparison' && (
              <StyledLinkCell to={`/home${value.href}` }>
                <AreaChartIcon height={16} />
                {value.text}
              </StyledLinkCell>
            )}
            {typeof value === 'object' && row.original.links.origin_object?.origin_type === 'UserFile' && (
              <StyledLinkCell to={`${value.href}`}>
                <FileIcon height={16} />
                {value.text}
              </StyledLinkCell>
            )}
            {typeof value === 'string' && value}
          </>
        )
      },
    },
    {
      header: 'State',
      accessorKey: 'state',
      enableColumnFilter: false,
      size: 120,
    },
    {
      header: 'Tags',
      accessorKey: 'tags',
      filterFn: 'includesString',
      enableSorting: false,
      size: 500,
      cell: ({ cell }) => (
        <StyledTags>
          {cell.row.original.tags.map(tag => (
            <StyledTagItem key={tag}>{tag}</StyledTagItem>
          ))}
        </StyledTags>
      ),
    },
    ...propertiesColumnDef<IFile>(properties),
  ]
}
