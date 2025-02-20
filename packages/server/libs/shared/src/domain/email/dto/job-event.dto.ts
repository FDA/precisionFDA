import { IsInt, Min } from 'class-validator'

export class JobEventDTO {
  @IsInt()
  @Min(1)
  jobId: number
}
