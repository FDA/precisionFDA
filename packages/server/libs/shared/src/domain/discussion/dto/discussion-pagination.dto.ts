import { IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { EntityScope } from '@shared/types/common'
import { HOME_SCOPE } from '@shared/enums'
import { PaginationDTO, SortDefinition } from '@shared/domain/entity/domain/pagination.dto'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { QueryOrder } from '@mikro-orm/core'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'

class DiscussionFilter {
  @IsOptional()
  @IsString()
  title: string
}

export class DiscussionPaginationDTO extends PaginationDTO<Discussion> {
  @IsOptional()
  @ValidateNested()
  @Type(() => DiscussionFilter)
  filter?: DiscussionFilter

  @IsValidScope({ allowHomeScope: true })
  scope: EntityScope | HOME_SCOPE

  //TODO Ludvik: (PFDA-6051) default to descending createdAt
  @IsOptional()
  sort?: SortDefinition<Discussion & { title: string }> = { createdAt: QueryOrder.DESC }
}
