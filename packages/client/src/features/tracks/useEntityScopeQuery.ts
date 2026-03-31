import { useQuery } from '@tanstack/react-query'
import { fetchApp } from '../apps/apps.api'
import { fetchDatabaseRequest } from '../databases/databases.api'
import { fetchExecution } from '../executions/executions.api'
import { fetchFile } from '../files/files.api'
import { ServerScope } from '../home/types'
import { EntityType } from './TrackProvenanceContent'

interface EntityScopeData {
  scope: ServerScope
  featured: boolean
}

async function fetchEntityScope(identifier: string, entityType: EntityType): Promise<EntityScopeData> {
  switch (entityType) {
    case 'file': {
      const data = await fetchFile(identifier)
      return { scope: data.files.scope, featured: data.files.featured }
    }
    case 'app': {
      const data = await fetchApp(identifier)
      return { scope: data.app.scope, featured: data.app.featured }
    }
    case 'database': {
      const data = await fetchDatabaseRequest(identifier)
      return { scope: data.scope, featured: data.featured }
    }
    case 'execution': {
      const data = await fetchExecution(identifier)
      return { scope: data.scope, featured: data.featured }
    }
    default:
      // For comparison and note, default to private scope
      return { scope: 'private', featured: false }
  }
}

export const useEntityScopeQuery = (identifier: string, entityType: EntityType) => {
  return useQuery({
    queryKey: ['entity-scope', identifier, entityType],
    queryFn: () => fetchEntityScope(identifier, entityType),
  })
}
