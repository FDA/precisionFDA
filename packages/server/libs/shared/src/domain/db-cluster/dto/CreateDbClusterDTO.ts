import { config } from '@shared/config'
import {
  allowedEngineVersions,
  allowedInstanceTypes,
  ENGINE,
  ENGINES,
} from '@shared/domain/db-cluster/db-cluster.enum'
import { STATIC_SCOPE } from '@shared/enums'
import { IsEnum, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateDbClusterDTO {
  @IsString()
  @MaxLength(config.validation.maxStrLen)
  name: string

  @IsString()
    // Assuming schemas.dxidProp defines some sort of string validation
  project: string

  @IsEnum(ENGINES)
  engine: ENGINE

  @IsString()
  @IsIn(allowedEngineVersions)
  engineVersion: string

  @IsString()
  @IsIn(allowedInstanceTypes)
  dxInstanceClass: string

  @IsString()
  @MinLength(8)
  @MaxLength(config.validation.maxStrLen)
  adminPassword: string


  @IsEnum(STATIC_SCOPE)
  scope: STATIC_SCOPE

  @IsString()
  @IsOptional()
  description?: string
}
