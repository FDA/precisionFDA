import { PaginationDto } from '@shared/domain/entity/domain/pagination.dto'
import { Type } from 'class-transformer'
import { IsOptional, IsString, ValidateNested } from 'class-validator'
import { ENGINES, STATUSES } from '../db-cluster.enum'
import { EntityScope } from '@shared/types/common'
import { DbCluster } from '../db-cluster.entity'

type DATABASE_INSTANCES = {
  db_std1_x2: 'DB Baseline 1 x 2'
  db_mem1_x2: 'DB Mem 1 x 2'
  db_mem1_x4: 'DB Mem 1 x 4'
  db_mem1_x8: 'DB Mem 1 x 8'
  db_mem1_x16: 'DB Mem 1 x 16'
  db_mem1_x32: 'DB Mem 1 x 32'
  db_mem1_x48: 'DB Mem 1 x 48'
  db_mem1_x64: 'DB Mem 1 x 64'
  db_mem1_x96: 'DB Mem 1 x 96'
}
class DbClusterFilter {
  @IsOptional()
  @Type(() => String)
  @IsString()
  name?: string

  @IsOptional()
  @Type(() => String)
  @IsString()
  status?: typeof STATUSES

  @IsOptional()
  @Type(() => String)
  @IsString()
  type?: typeof ENGINES

  @IsOptional()
  @Type(() => String)
  @IsString()
  instance?: DATABASE_INSTANCES

  @IsOptional()
  tags?: string
}

export class DbClusterPaginationDTO extends PaginationDto<DbCluster> {
  @IsOptional()
  scope: 'spaces' | EntityScope

  @IsOptional()
  @ValidateNested()
  @Type(() => DbClusterFilter)
  filters?: DbClusterFilter
}
