import { IsBoolean, IsOptional, IsString } from 'class-validator'

/**
 * DTO for job snapshot request body.
 */
export class JobSnapshotBodyDTO {
  @IsString()
  name: string

  @IsBoolean()
  @IsOptional()
  terminate: boolean = false

  @IsString()
  @IsOptional()
  preScript?: string
}
