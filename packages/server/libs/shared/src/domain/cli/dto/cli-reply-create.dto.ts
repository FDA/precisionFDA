import { Type } from 'class-transformer'
import {
  IsEnum,
  IsNumber,
  IsString,
  MinLength,
  registerDecorator,
  ValidateIf,
  ValidateNested,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'

@ValidatorConstraint({ name: 'isValidReplyTarget', async: false })
class IsValidReplyTargetConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CliReplyCreateDTO
    const hasDiscussion = dto.discussionId != null
    const hasAnswer = dto.answerId != null

    if (hasDiscussion === hasAnswer) {
      // both or neither
      return false
    }

    if (hasAnswer && dto.replyType === DISCUSSION_REPLY_TYPE.ANSWER) {
      return false
    }

    return true
  }

  defaultMessage(): string {
    return 'Provide exactly one of discussionId or answerId; answerId is only valid when replyType is "Comment".'
  }
}

function IsValidReplyTarget(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidReplyTarget',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidReplyTargetConstraint,
    })
  }
}

export class CliReplyCreateDTO {
  @ValidateIf(obj => !obj.answerId)
  @IsNumber()
  discussionId?: number

  @ValidateIf(obj => !obj.discussionId)
  @IsNumber()
  answerId?: number

  @IsEnum(DISCUSSION_REPLY_TYPE)
  @IsValidReplyTarget()
  replyType: DISCUSSION_REPLY_TYPE

  @IsString()
  @MinLength(1)
  content: string

  @ValidateNested()
  @Type(() => CliAttachmentsDTO)
  attachments: CliAttachmentsDTO = new CliAttachmentsDTO()
}
