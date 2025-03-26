import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'
import { DbCluster } from './db-cluster.entity'

export class DbClusterRepository extends PaginatedRepository<DbCluster> {}
