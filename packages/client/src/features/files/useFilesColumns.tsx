import { useQueryClient } from '@tanstack/react-query'
import type { Column, ColumnDef, FilterFnOption } from '@tanstack/react-table'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import { CopyText } from '../../components/CopyText/CopyText'
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
import styles from './FileList.module.css'
import { getOriginHref } from './file.utils'
import type { IFile, INode } from './files.types'

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
}): ColumnDef<INode>[] => {
  const queryClient = useQueryClient()

  return [
    selectColumnDef<INode>(),
    {
      header: 'Name',
      accessorKey: 'name',
      filterFn: 'includesString',
      size: 400,
      cell: ({ cell }) => {
        const node = cell.row.original
        return (
          <StyledLocked $isLocked={node.locked}>
            {node.stiType === 'UserFile' ? (
              <>
                <StyledNameCell
                  data-testid="file-row-name"
                  data-tooltip-id={`fileNameTooltip${(node as IFile).uid}`}
                  data-tooltip-content={`File is in ${node.state} state.`}
                  color={isIncompleteFile(node.state) ? 'var(--tertiary-600)' : 'var(--c-link)'}
                  onClick={() => onFileClick((node as IFile).uid)}
                >
                  <FileIcon height={14} />
                  {(node as IFile).locked && <LockIcon height={12} color={colors.darkYellow} />}

                  {node.name}
                </StyledNameCell>
                {isIncompleteFile(node.state) && (
                  <Tooltip id={`fileNameTooltip${(node as IFile).uid}`} style={{ zIndex: 2 }} />
                )}
              </>
            ) : (
              <>
                <StyledNameCell
                  data-testid="folder-row-name"
                  data-tooltip-id={`folderNameTooltip${node.id}`}
                  data-tooltip-content="Folder is being removed."
                  color={node.state === 'removing' ? 'var(--tertiary-600)' : undefined}
                  style={node.state === 'removing' ? { pointerEvents: 'none' } : undefined}
                  onClick={node.state === 'removing' ? undefined : () => onFolderClick(node.id.toString())}
                >
                  <FolderIcon height={14} />
                  {node.locked && <LockIcon height={12} color={colors.darkYellow} />}
                  {node.name}
                </StyledNameCell>
                {node.state === 'removing' && <Tooltip id={`folderNameTooltip${node.id}`} style={{ zIndex: 2 }} />}
              </>
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
        const val = node.stiType === 'Folder' ? node.id.toString() : (node as IFile).uid
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
    {
      header: 'Location',
      accessorKey: 'location',
      // TODO (PFDA-7013): support sorting location string in Nodejs
      enableSorting: false,
      filterFn: 'includesString',
      size: 250,
      cell: ({ row, getValue }) => {
        const spaceId = row.original.spaceId
        const spaceLink = spaceId ? `/spaces/${spaceId}/files` : null
        if (spaceLink) {
          return (
            <StyledLinkCell to={spaceLink}>
              <ObjectGroupIcon />
              {getValue<string>()}
            </StyledLinkCell>
          )
        }
        return <>{getValue<string>()}</>
      },
    },
    {
      header: 'Featured',
      accessorKey: 'featured',
      enableColumnFilter: false,
      size: 93,
      cell: ({ cell }) => {
        const id = cell.row.original.stiType === 'Folder' ? cell.row.original.id : (cell.row.original as IFile).uid
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
      accessorKey: 'addedBy',
      // TODO (PFDA-7013): support sorting full name in Nodejs
      enableSorting: false,
      filterFn: 'includesString',
      size: 198,
    },
    {
      header: 'Size',
      accessorKey: 'fileSize',
      size: 160,
      filterFn: numberRangeFilterFn as FilterFnOption<INode>,
      meta: {
        filterElement: (column: Column<INode>) => (
          <NumberRangeFilter column={column} fromPlaceholder="Min (KB)" toPlaceholder="Max (KB)" />
        ),
      },
    },
    {
      header: 'Created',
      accessorKey: 'createdAtDateTime',
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
        if (row.original.stiType === 'Folder') {
          return
        }
        const file = row.original as IFile
        const value = file.origin
        const originType = file.originObject?.originType
        const originHref = getOriginHref(file.originObject)
        return (
          <>
            {typeof value === 'object' && value !== null && originType === 'Job' && originHref && (
              <StyledLinkCell to={originHref}>
                <CogsIcon height={14} />
                {value.text}
              </StyledLinkCell>
            )}
            {typeof value === 'object' && value !== null && originType === 'Comparison' && originHref && (
              <StyledLinkCell to={originHref}>
                <AreaChartIcon height={16} />
                {value.text}
              </StyledLinkCell>
            )}
            {typeof value === 'object' &&
              value !== null &&
              ['UserFile', 'Node'].includes(originType ?? '') &&
              originHref && (
                <StyledLinkCell to={originHref}>
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
          {cell.row.original.tags?.map(tag => (
            <StyledTagItem key={tag}>{tag}</StyledTagItem>
          ))}
        </StyledTags>
      ),
    },
    // TODO (PFDA-7013): support sorting properties in Nodejs
    ...propertiesColumnDef<INode>(properties).map(col => {
      return {
        ...col,
        enableSorting: false,
      }
    }),
  ]
}
