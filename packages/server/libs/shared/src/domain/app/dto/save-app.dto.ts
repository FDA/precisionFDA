import { AppInputSpecItem, AppSpecItem } from '@shared/domain/app/app.input'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityScope } from '@shared/types/common'
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator'

export class SaveAppDTO {
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
  input_spec: AppInputSpecItem[]

  @IsOptional()
  @IsArray()
  output_spec?: AppSpecItem[]
}
