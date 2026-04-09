import { IsIn, IsNumber, IsObject, IsOptional, IsString, Max, Min } from 'class-validator'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { RESOURCE_TYPES, Resource } from '@shared/domain/user/user.entity'
import { EntityScope } from '@shared/types/common'

class RunAppInputDTO {
  @IsString()
  snapshot: string

  @IsOptional()
  @IsString()
  feature?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number

  @IsOptional()
  @IsString()
  cmd?: string

  @IsOptional()
  @IsString()
  imagename?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number // https apps
}

// DTO for CLI command to run an app
// Given the nature of CLI, all fields are optional; user's personal defaults will be applied before launching the job
export class CliRunAppDTO {
  @IsOptional()
  @IsValidScope({ allowPublic: false, allowHomeScope: false })
  scope: EntityScope

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsIn(RESOURCE_TYPES)
  instanceType: Resource

  @IsOptional()
  @IsNumber()
  @Min(0)
  jobLimit: number

  @IsOptional()
  @IsObject()
  inputs?: RunAppInputDTO

  @IsOptional()
  @IsString()
  outputFolderPath?: string
}
