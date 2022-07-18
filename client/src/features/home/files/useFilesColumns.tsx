import React, { useMemo } from 'react'
import { useQueryClient } from 'react-query'
import ReactTooltip from 'react-tooltip'
import { Column } from 'react-table'
import {
  DefaultColumnFilter,
  NumberRangeColumnFilter,
  SelectColumnFilter,
} from '../../../components/Table/filters'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { IFile } from './files.types'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { StyledLinkCell, StyledNameCell } from '../home.styles'
import { FeaturedToggle } from '../../../components/FeaturedToggle'
import { TaskIcon } from '../../../components/icons/TaskIcon'
import { AreaChartIcon } from '../../../components/icons/AreaChartIcon'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import { KeyVal } from '../types'
import { colors } from '../../../styles/theme'

const markIncompleteFile = (file: any) => (file.state === 'open') || (file.state === 'closing')

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
  const queryClient = useQueryClient()
  return useMemo<Column<IFile>[]>(
    () =>
      [
        {
          Header: 'Name',
          accessor: 'name',
          Filter: DefaultColumnFilter,
          width: colWidths?.name || 400,
          Cell: props => (
            <>
              {props.cell.row.original.type === 'UserFile' ? (
                <>
                  <StyledNameCell data-tip data-for={`fileNameTooltip${props.cell.row.original.uid}`}
                  color={(markIncompleteFile(props.cell.row.original)) ? colors.stateLabelGrey : colors.primaryBlue}
                    onClick={() => onFileClick(props.cell.row.original.uid)} >
                    <FileIcon height={14} />
                      {props.value}
                  </StyledNameCell>
                  {markIncompleteFile(props.cell.row.original) && 
                  <ReactTooltip id={`fileNameTooltip${props.cell.row.original.uid}`} place="top" effect="solid">
                    File is in {props.cell.row.original.state} state.
                  </ReactTooltip>
                  }
                </>
              ) : (
                <StyledNameCell
                  onClick={() =>
                    onFolderClick(props.cell.row.original.id.toString())
                  }
                >
                  <FolderIcon height={14} />
                  {props.value}
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
          Cell: props => (
            <StyledLinkCell to={`${props.row.original.links.space}/files`}><ObjectGroupIcon />{props.value}</StyledLinkCell>
          ),
        },
        {
          Header: 'Featured',
          accessor: 'featured',
          disableSortBy: true,
          Filter: SelectColumnFilter,
          options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false'}],
          width: colWidths?.featured || 93,
          Cell: props => {
            const id = props.cell.row.original.type === 'Folder' ? props.cell.row.original.id : props.cell.row.original.uid
            return <div style={{ paddingLeft: 20 }}><FeaturedToggle disabled={!isAdmin}  resource="files" featured={props.cell.row.original.featured} uids={[id]} onSuccess={() => queryClient.invalidateQueries(['files'])} /></div>
          },
        },
        {
          Header: 'Added By',
          accessor: 'added_by',
          Filter: DefaultColumnFilter,
          width: colWidths?.added_by || 198,
          Cell: props => (  
            <a href={props.cell.row.original.links.user || ''}>
              {props.value}
            </a>
          ),
        },
        {
          Header: 'Size',
          accessor: 'file_size',
          Filter: NumberRangeColumnFilter,
          width: colWidths?.file_size || 160,
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
          Cell: props => {
            return(
              <>
                {typeof props.value === 'object' && props.row.original.links.origin_object?.origin_type === 'Job' && <StyledLinkCell to={`/home/executions/${props.row.original.links.origin_object?.origin_uid}` || '#'}><TaskIcon height={14}/>{props.value.text}</StyledLinkCell>}
                {typeof props.value === 'object' && props.row.original.links.origin_object?.origin_type === 'Comparison' && <StyledLinkCell to={`/home${props.value.href}` || '#'}><AreaChartIcon height={16}/>{props.value.text}</StyledLinkCell>}
                {typeof props.value === 'object' && props.row.original.links.origin_object?.origin_type === 'UserFile' && <StyledLinkCell to={`/home/files/${props.row.original.links.origin_object?.origin_uid}` || '#'}><FileIcon height={16}/>{props.value.text}</StyledLinkCell>}
                {typeof props.value === 'string' && props.value}
              </>
          )}
        },
        {
          Header: 'Tags',
          accessor: 'tags',
          Filter: DefaultColumnFilter,
          disableSortBy: true,
          width: colWidths?.tags || 500,
          Cell: props => {
            return(
              <StyledTags>
                {props.value.map(tag => (
                  <StyledTagItem key={tag}>{tag}</StyledTagItem>
                ))}
              </StyledTags>
          )}
        },
      ] as Column<IFile>[],
    [],
  )
}
