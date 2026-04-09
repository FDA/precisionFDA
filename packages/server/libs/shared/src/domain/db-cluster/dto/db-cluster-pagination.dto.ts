import { Type } from 'class-transformer'
import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'
import { EntityScope } from '@shared/types/common'
import { DbCluster } from '../db-cluster.entity'
import { allowedEngines, STATUSES } from '../db-cluster.enum'

class DbClusterFilter {
  @IsOptional()
  @Type(() => String)
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  @IsIn(Object.values(STATUSES))
  status?: string

  @IsOptional()
  @IsString()
  @IsIn(allowedEngines)
  engine?: string

  @IsOptional()
  @IsString()
  instance?: string

  @IsOptional()
  tags?: string
}

export class DbClusterPaginationDTO extends PaginationDTO<DbCluster> {
  @IsValidScope({
    allowPublic: false,
    allowHomeScope: { me: false, featured: false, everybody: false, spaces: true },
  })
  scope: 'spaces' | EntityScope

  @IsOptional()
  @ValidateNested()
  @Type(() => DbClusterFilter)
  filter?: DbClusterFilter
}
