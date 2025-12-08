import { useDroppable } from '@dnd-kit/core'
import React, { useMemo } from 'react'
import { Link } from 'react-router'
import { Pill } from '../../components/Pill'
import { FolderIcon } from '../../components/icons/FolderIcon'
import { HomeIcon } from '../../components/icons/HomeIcon'
import { DroppableProps } from '../../components/Table/DnD'
import { cleanObject } from '../../utils/object'
import { HomeScope, MetaPath } from '../home/types'
import styles from './FileBreadcrumb.module.css'

interface BreadcrumbItem {
  id: number
  name: string
  href: string
  isActive: boolean
}

const DroppablePathDir: React.FC<DroppableProps & { children: React.ReactNode }> = ({ 
  id, 
  name, 
  children, 
  disabled = false, 
  ...rest 
}) => {  
  const { setNodeRef, isOver } = useDroppable({ id, disabled, data: { name }})

  return (
    <div 
      ref={setNodeRef} 
      className={styles.droppable}
      data-is-over={isOver}
      {...rest}
    >
      {children}
    </div>
  )
}

const createSearchParam = (params: Record<string, unknown>) => {
  const query = cleanObject(params)
  const paramQ = `?${new URLSearchParams(query as Record<string, string>).toString()}`
  return paramQ
}

const MAX_VISIBLE_BREADCRUMBS = 5

export const FileBreadcrumb = ({ 
  currentFolderId, 
  basePath, 
  scope, 
  labelText, 
  fileName, 
  metaPath = [] 
}: { 
  currentFolderId?: number
  basePath: string
  scope?: HomeScope
  labelText?: string
  fileName?: string
  metaPath?: MetaPath[]
}) => {
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    return [
      { 
        id: 0, 
        name: 'Files', 
        href: `${basePath}${createSearchParam({ scope })}`,
        isActive: currentFolderId === 0 || !currentFolderId
      },
      ...(metaPath || []).map(folder => ({
        id: folder.id,
        name: folder.name,
        href: `${basePath}${createSearchParam({ scope, folder_id: folder.id })}`,
        isActive: currentFolderId === folder.id
      }))
    ]
  }, [currentFolderId, basePath, scope, metaPath])

  // Determine if we need to collapse breadcrumbs
  const needsCollapse = breadcrumbs.length > MAX_VISIBLE_BREADCRUMBS

  // Get visible breadcrumbs
  const visibleBreadcrumbs = useMemo(() => {
    if (!needsCollapse) return breadcrumbs
    
    // Always show first item, collapsed indicator, and last MAX_VISIBLE_BREADCRUMBS - 1 items
    return [
      breadcrumbs[0],
      ...breadcrumbs.slice(-(MAX_VISIBLE_BREADCRUMBS - 1))
    ]
  }, [breadcrumbs, needsCollapse])

  return (
    <div className={styles.breadcrumbContainer}>
      <div className={styles.pathContainer}>
        {breadcrumbs.map((breadcrumb, index) => {
          const isFirst = index === 0
          const isLast = index === breadcrumbs.length - 1
          const isActive = breadcrumb.isActive

          return (
            <React.Fragment key={`breadcrumb-${breadcrumb.id}`}>
              {/* Divider between items */}
              {!isFirst && (
                <span className={styles.divider}>/</span>
              )}

              {/* Breadcrumb item */}
              <DroppablePathDir 
                id={breadcrumb.id} 
                name={breadcrumb.name} 
                disabled={isActive}
              >
                {isActive ? (
                  <Pill 
                    variant="default"
                    size="small"
                    icon={isFirst ? <HomeIcon /> : <FolderIcon />}
                  >
                    {breadcrumb.name}
                  </Pill>
                ) : (
                  <Link to={breadcrumb.href} className={styles.breadcrumbPillLink}>
                    <Pill 
                      variant="secondary"
                      size="small"
                      icon={isFirst ? <HomeIcon /> : <FolderIcon />}
                    >
                      {breadcrumb.name}
                    </Pill>
                  </Link>
                )}
              </DroppablePathDir>
            </React.Fragment>
          )
        })}

        {fileName && (
          <>
            <span className={styles.divider}>/</span>
            <div className={styles.fileNameItem}>{fileName}</div>
          </>
        )}
      </div>
    </div>
  )
}
