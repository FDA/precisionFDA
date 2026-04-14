import type { HomeScope } from '../home/types'

export type ExecutionColumnVisibilityContext = 'home' | 'app' | 'workflow'

export type ExecutionColumnLike = {
  id?: unknown
  accessorKey?: unknown
}

const HOME_ALWAYS_HIDDEN_COLUMNS = ['createdAtDateTime', 'workflowTitle'] as const
const APP_HIDDEN_COLUMNS = ['featured', 'app_title', 'location', 'select'] as const
const WORKFLOW_HIDDEN_COLUMNS = ['workflow', 'featured', 'location', 'tags', 'select'] as const

export function getHiddenExecutionColumns(
  context: ExecutionColumnVisibilityContext,
  homeScope?: HomeScope,
): ReadonlySet<string> {
  if (context === 'home') {
    const hiddenColumns = new Set<string>(HOME_ALWAYS_HIDDEN_COLUMNS)

    if (homeScope === 'me') {
      hiddenColumns.add('addedBy')
    }

    if (homeScope !== 'spaces') {
      hiddenColumns.add('location')
    }

    if (homeScope !== 'everybody') {
      hiddenColumns.add('featured')
    }

    return hiddenColumns
  }

  if (context === 'app') {
    return new Set(APP_HIDDEN_COLUMNS)
  }

  return new Set(WORKFLOW_HIDDEN_COLUMNS)
}

export function shouldShowExecutionColumn(
  context: ExecutionColumnVisibilityContext,
  column: ExecutionColumnLike,
  homeScope?: HomeScope,
): boolean {
  const hiddenColumns = getHiddenExecutionColumns(context, homeScope)
  const identifiers = [column.id, column.accessorKey].filter(
    (value): value is string => typeof value === 'string',
  )

  return identifiers.every(identifier => !hiddenColumns.has(identifier))
}
