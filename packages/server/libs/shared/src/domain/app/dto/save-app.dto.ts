import { IsBoolean, IsString, IsArray, IsOptional } from 'class-validator'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Spec } from '@shared/domain/app/app.input'
import { EntityScope } from '@shared/types/common'

export class SaveAppDto {
  @IsBoolean()
  createAppSeries = false

  @IsBoolean()
  createAppRevision = false

  // TODO candidate for removal
  @IsBoolean()
  @IsOptional()
  is_new?: boolean

  @IsOptional()
  @IsString()
  forked_from?: string

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  scope?: EntityScope

  @IsString()
  title: string

  @IsString()
  release: string

  @IsString()
  readme: string

  @IsBoolean()
  internet_access: boolean

  @IsString()
  instance_type: string

  @IsArray()
  packages: string[]

  @IsString()
  code: string

  @IsArray()
  ordered_assets: Uid<'file'>[]

  @IsString()
  @IsOptional()
  entity_type?: string

  @IsArray()
  input_spec: Spec[]

  @IsOptional()
  @IsArray()
  output_spec?: Spec[]
}
