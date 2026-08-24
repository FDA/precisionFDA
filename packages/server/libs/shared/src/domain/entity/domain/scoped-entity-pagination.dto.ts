import { Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { HOME_SCOPE } from '@shared/enums'
import { EntityScope } from '@shared/types/common'
import { IsValidScope } from '../constraint/is-valid-scope.constraint'
import { PaginationDTO } from './pagination.dto'

export class ScopedEntityFilter {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  location?: string
}

export class ScopedEntityPaginationDTO<Entity extends object> extends PaginationDTO<Entity> {
  @IsOptional()
  @IsValidScope({
    allowPrivate: true,
    allowPublic: true,
    allowSpace: true,
    allowHomeScope: { me: false, featured: false, everybody: false, spaces: true },
  })
  scope?: HOME_SCOPE.SPACES | EntityScope

  @IsOptional()
  @ValidateNested()
  @Type(() => ScopedEntityFilter)
  filter?: ScopedEntityFilter
}
