import React from 'react'
import { Link } from 'react-router-dom'
import { BreadcrumbDivider, BreadcrumbLabel, StyledBreadcrumbs } from '../../components/Breadcrumb'
import { cleanObject } from '../../utils/object'
import { HomeScope, MetaPath } from '../home/types'

const createSearchParam = (params: Record<string, unknown>) => {
  const query = cleanObject(params)
  const paramQ = `?${new URLSearchParams(query as Record<string, string>).toString()}`
  return paramQ
}

export const FileBreadcrumb = ({ basePath, scope, labelText, fileName, metaPath = []}: { basePath: string, scope?: HomeScope, labelText?: string, fileName?: string, metaPath?: MetaPath[]}) => (
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
        <Link key={`folder-${folder.id}`} to={folder.href || ''}>
          {folder.name}
        </Link>
      ))
      .concat(<div key="filename">{fileName}</div>)
      // @ts-ignore
      .reduce((prev, curr) => [prev, <BreadcrumbDivider key={`divider-${prev.id}`}>/</BreadcrumbDivider>, curr])}
      
  </StyledBreadcrumbs>
)
