import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { EntityScope, IOType } from '@shared/types/common'
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class RunAppDTO {
  @IsString()
  name: string

  @IsValidScope({ allowPublic: false })
  scope: EntityScope

  @IsString()
  @IsNotEmpty()
  instanceType: string

  @IsNumber()
  jobLimit: number

  @IsString()
  @IsOptional()
  outputFolderPath?: string = ''

  @IsObject()
  inputs: Record<string, IOType>
}
