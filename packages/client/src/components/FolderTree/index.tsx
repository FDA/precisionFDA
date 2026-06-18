import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import type React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { cn } from '@/utils/cn'

export interface FolderTreeNode {
  id: string
  name: string
  children?: FolderTreeNode[]
  isLoaded?: boolean
}

export interface FolderTreePath {
  id: string
  name: string
}

export interface FolderTreeProps {
  /** Async function to fetch children for a given folder id (null = root) */
  fetchChildren: (folderId: string | null) => Promise<FolderTreeNode[]>
  /** Called when a folder is selected, with the full path from root */
  onSelect?: (node: FolderTreeNode, path: FolderTreePath[]) => void
  /** Currently selected folder id */
  selectedId?: string | null
  /** Root label displayed at the top of the tree */
  rootLabel?: string
  /** Additional class names for the outer container */
  className?: string
  /** How long fetched data stays fresh (ms). Defaults to 0 */
  staleTime?: number
  /** Extra key segments added to query keys so caches stay separate per scope */
  queryKeyPrefix?: string[]
}

interface TreeNodeItemProps {
  node: FolderTreeNode
  depth: number
  selectedId?: string | null
  onSelect?: (node: FolderTreeNode, path: FolderTreePath[]) => void
  fetchChildren: (folderId: string | null) => Promise<FolderTreeNode[]>
  staleTime: number
  /** Ancestor path from root to this node's parent */
  parentPath: FolderTreePath[]
  queryKeyPrefix: string[]
  rootExpanded?: boolean
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  depth,
  selectedId,
  onSelect,
  fetchChildren,
  staleTime,
  parentPath,
  queryKeyPrefix,
  rootExpanded,
}: TreeNodeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(rootExpanded ?? false)
  const isSelected = selectedId === node.id

  const currentPath = useMemo(() => [...parentPath, { id: node.id, name: node.name }], [parentPath, node.id, node.name])

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['folder-tree-children', ...queryKeyPrefix, node.id],
    queryFn: () => fetchChildren(node.id === 'ROOT' ? null : node.id),
    enabled: isExpanded,
    staleTime,
  })

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const handleSelect = useCallback(() => {
    if (!isExpanded) setIsExpanded(true)
    onSelect?.(node, currentPath)
  }, [onSelect, node, currentPath, isExpanded])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    } else if (e.key === 'ArrowRight' && !isExpanded) {
      e.preventDefault()
      handleToggle()
    } else if (e.key === 'ArrowLeft' && isExpanded) {
      e.preventDefault()
      handleToggle()
    }
  }

  const handleClickFolder = (e: React.MouseEvent): void => {
    e.stopPropagation()
    handleToggle()
  }

  return (
    <div>
      <div
        role="treeitem"
        aria-expanded={isExpanded}
        aria-selected={isSelected}
        tabIndex={0}
        className={cn(
          'flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors select-none',
          'hover:bg-accent hover:text-accent-foreground',
          isSelected && 'bg-accent text-accent-foreground font-medium',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex size-4 shrink-0 items-center justify-center rounded-sm"
          onClick={handleClickFolder}
          tabIndex={-1}
          aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
        >
          {isLoading ? (
            <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : isExpanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>
        {isExpanded ? (
          <FolderOpen className="text-muted-foreground size-4 shrink-0" />
        ) : (
          <Folder className="text-muted-foreground size-4 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isExpanded && children.length > 0 && (
        <div>
          {children.map(child => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              fetchChildren={fetchChildren}
              staleTime={staleTime}
              parentPath={currentPath}
              queryKeyPrefix={queryKeyPrefix}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  fetchChildren,
  onSelect,
  selectedId,
  rootLabel = '/',
  className,
  staleTime = 0,
  queryKeyPrefix = [],
}: {
  fetchChildren: (folderId: string | null) => Promise<FolderTreeNode[]>
  onSelect?: (node: FolderTreeNode, path: FolderTreePath[]) => void
  selectedId?: string | null
  rootLabel?: string
  className?: string
  staleTime?: number
  queryKeyPrefix?: string[]
}) => {
  const rootNode: FolderTreeNode = {
    id: 'ROOT',
    name: rootLabel,
    children: [],
    isLoaded: false,
  }

  return (
    <div className={cn('overflow-y-auto', className)} role="tree" aria-label="Folder tree">
      <TreeNodeItem
        node={rootNode}
        depth={0}
        selectedId={selectedId}
        onSelect={onSelect}
        fetchChildren={fetchChildren}
        staleTime={staleTime}
        parentPath={[]}
        queryKeyPrefix={queryKeyPrefix}
        rootExpanded={true}
      />
    </div>
  )
}
