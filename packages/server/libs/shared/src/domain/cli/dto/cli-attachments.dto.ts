import { IsArray } from 'class-validator'
import { Uid } from '@shared/domain/entity/domain/uid'

export class CliAttachmentsDTO {
  @IsArray()
  files: Uid<'file'>[] = []

  @IsArray()
  folders: number[] = []

  @IsArray()
  assets: Uid<'file'>[] = []

  @IsArray()
  apps: Uid<'app'>[] = []

  @IsArray()
  jobs: Uid<'job'>[] = []

  @IsArray()
  comparisons: number[] = []
}
