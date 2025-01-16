import { IsArray, IsNumber } from 'class-validator'

export class AttachmentsDTO {
  @IsArray()
  @IsNumber({}, { each: true })
  files: number[] = []

  @IsArray()
  @IsNumber({}, { each: true })
  folders: number[] = []

  @IsArray()
  @IsNumber({}, { each: true })
  assets: number[] = []

  @IsArray()
  @IsNumber({}, { each: true })
  apps: number[] = []

  @IsArray()
  @IsNumber({}, { each: true })
  jobs: number[] = []

  @IsArray()
  @IsNumber({}, { each: true })
  comparisons: number[] = []
}
