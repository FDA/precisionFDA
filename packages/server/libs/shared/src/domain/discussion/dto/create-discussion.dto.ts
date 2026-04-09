import { Type } from 'class-transformer'
import { IsString, MinLength, Validate, ValidateNested } from 'class-validator'
import { NotifyConstraint, NotifyType } from '@shared/domain/discussion/dto/notify.type'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { EntityScope } from '@shared/types/common'
import { AttachmentsDTO } from './attachments.dto'

export class CreateDiscussionDTO {
  @IsString()
  @MinLength(1)
  title: string

  @IsString()
  @MinLength(1)
  content: string

  @IsValidScope({ allowPrivate: false })
  scope: EntityScope

  @ValidateNested()
  @Type(() => AttachmentsDTO)
  attachments: AttachmentsDTO = new AttachmentsDTO()

  @Validate(NotifyConstraint)
  notify: NotifyType = []
}
