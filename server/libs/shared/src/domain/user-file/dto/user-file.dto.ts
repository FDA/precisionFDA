import { STATIC_SCOPE } from '@shared/enums'
import { SCOPE } from '@shared/types/common'
import { Transform } from 'class-transformer'
import { IsIn, IsOptional, IsString, Matches } from 'class-validator'

export class ResolvePathDTO {
  @IsString()
  @IsOptional()
  @Transform((path) => path.value || '/')
  path: string = '/'

  @IsOptional()
  @Matches(new RegExp(`^(${STATIC_SCOPE.PRIVATE}|${STATIC_SCOPE.PUBLIC}|space-[0-9]+)?$`))
  @Transform((scope) => scope.value || STATIC_SCOPE.PRIVATE)
  scope: SCOPE = STATIC_SCOPE.PRIVATE

  @IsOptional()
  @IsIn(['file', 'folder', ''])
  @Transform((type) => type.value || null)
  type: 'folder' | 'file' | null = null
}
