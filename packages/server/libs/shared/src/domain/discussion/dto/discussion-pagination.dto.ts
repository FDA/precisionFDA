import { QueryOrder } from '@mikro-orm/core'
import { Type } from 'class-transformer'
import { IsOptional, IsString, ValidateNested } from 'class-validator'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { PaginationDTO, SortDefinition } from '@shared/domain/entity/domain/pagination.dto'
import { HOME_SCOPE } from '@shared/enums'
import { EntityScope } from '@shared/types/common'

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

  @IsValidScope({ allowHomeScope: { me: false, featured: false, everybody: true, spaces: true } })
  scope: EntityScope | HOME_SCOPE.EVERYBODY | HOME_SCOPE.SPACES

  //TODO Ludvik: (PFDA-6051) default to descending createdAt
  @IsOptional()
  sort?: SortDefinition<Discussion & { title: string }> = { createdAt: QueryOrder.DESC }
}
