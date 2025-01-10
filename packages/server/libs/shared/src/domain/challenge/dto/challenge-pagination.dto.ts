import { PaginationDto } from '@shared/domain/entity/domain/pagination.dto'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, ValidateNested } from 'class-validator'

export enum FILTER_STATUS {
  CURRENT = 'current',
  UPCOMING = 'upcoming',
  ENDED = 'ended',
}

class ChallengeFilter {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year: number

  @IsOptional()
  @IsEnum(FILTER_STATUS)
  status: FILTER_STATUS
}

export class ChallengePaginationDto extends PaginationDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChallengeFilter)
  filter?: ChallengeFilter
}
