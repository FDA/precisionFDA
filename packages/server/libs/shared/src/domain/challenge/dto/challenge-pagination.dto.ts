import { QueryOrder } from '@mikro-orm/core'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, ValidateNested } from 'class-validator'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { PaginationDTO, SortDefinition } from '@shared/domain/entity/domain/pagination.dto'

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

export class ChallengePaginationDto extends PaginationDTO<Challenge> {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChallengeFilter)
  filter?: ChallengeFilter

  // default to descending endAt
  sort?: SortDefinition<Challenge> = { endAt: QueryOrder.DESC }
}
