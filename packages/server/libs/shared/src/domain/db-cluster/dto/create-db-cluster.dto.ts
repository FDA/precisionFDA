import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { config } from '@shared/config'
import { allowedEngines, allowedEngineVersions, allowedInstanceTypes } from '@shared/domain/db-cluster/db-cluster.enum'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { EntityScope } from '@shared/types/common'

export class CreateDbClusterDTO {
  @IsString()
  @MaxLength(config.validation.maxStrLen)
  name: string

  @IsString()
  @IsIn(allowedEngines)
  engine: string

  @IsString()
  @IsIn(allowedEngineVersions)
  engineVersion: string

  @IsString()
  @IsIn(allowedInstanceTypes)
  dxInstanceClass: string

  @IsValidScope({ allowPublic: false })
  scope: EntityScope

  @IsString()
  @IsOptional()
  description?: string
}
