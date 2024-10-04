import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import { Link } from 'react-router-dom'
import { BreadcrumbDivider, BreadcrumbLabel, StyledBreadcrumbs } from '../../components/Breadcrumb'
import { DroppableProps } from '../../components/Table/DnD'
import { cleanObject } from '../../utils/object'
import { HomeScope, MetaPath } from '../home/types'

const mstyle = {
  borderRadius: '4px',
  padding: '1px 7px',
  display: 'flex',
  alignItems: 'center',
}

const DroppablePathDir: React.FC<DroppableProps> = ({ id, name, children, style = {}, numSelected = 0, disabled = false, ...rest }) => {  
  const { setNodeRef, isOver } = useDroppable({ id, disabled, data: { name }})

  const dstyle = {
    ...style,
    ...mstyle,
    backgroundColor: isOver ? 'var(--highlight-100)' : undefined,
    border: isOver ? '1px solid var(--highlight-500)' : '1px solid rgba(0, 0, 0, 0)',
  }

  return (
    <div ref={setNodeRef} {...rest} style={dstyle}>
      {children}
    </div>
  )
}

const createSearchParam = (params: Record<string, unknown>) => {
  const query = cleanObject(params)
  const paramQ = `?${new URLSearchParams(query as Record<string, string>).toString()}`
  return paramQ
}

export const FileBreadcrumb = ({ currentFolderId, basePath, scope, labelText, fileName, metaPath = []}: { currentFolderId: number, basePath: string, scope?: HomeScope, labelText?: string, fileName?: string, metaPath?: MetaPath[]}) => (
  <StyledBreadcrumbs>
    {labelText && <BreadcrumbLabel>{labelText}</BreadcrumbLabel>}
    {[{ id: 0, name: 'Files', href: `${basePath}${createSearchParam({ scope })}` }]
      .concat(
        metaPath.map(folder => ({
          id: folder.id,
          name: folder.name,
          href: `${basePath}${createSearchParam({ scope, folder_id: folder.id })}`,
        })),
      )
      .map(folder => (
        <DroppablePathDir key={`folder-${folder.id}`} name={folder.name} id={folder.id} disabled={currentFolderId === folder.id}>
          <Link to={folder.href || ''}>
            {folder.name}
          </Link>
        </DroppablePathDir>
      ))
      .concat(<div key="filename" style={mstyle}>{fileName}</div>)
      // @ts-ignore
      .reduce((prev, curr) => [prev, <BreadcrumbDivider key={`divider-${prev.id}`}>/</BreadcrumbDivider>, curr])}
  </StyledBreadcrumbs>
)
