import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { RESOURCE_TYPES, Resource } from '@shared/domain/user/user.entity'
import { EntityScope, IOType } from '@shared/types/common'

export class RunAppDTO {
  @IsString()
  name: string

  @IsValidScope({ allowPublic: false })
  scope: EntityScope

  @IsString()
  @IsNotEmpty()
  @IsIn(RESOURCE_TYPES, { message: 'Instance type must be a valid resource type' })
  instanceType: Resource

  @IsNumber()
  jobLimit: number

  @IsString()
  @IsOptional()
  outputFolderPath?: string = ''

  @IsObject()
  inputs: Record<string, IOType>
}
