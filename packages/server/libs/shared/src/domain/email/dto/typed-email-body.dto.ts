import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional } from 'class-validator'
import { EmailTypeToInputMap } from '@shared/domain/email/dto/email-type-to-input.map'
import { IsEmailInputValid } from '@shared/domain/email/dto/is-email-input-valid.constraint'

export type EmailInputFormat = keyof EmailTypeToInputMap

export class TypedEmailBodyDto<T extends EMAIL_TYPES = EMAIL_TYPES.emailWithoutTemplate> {
  @IsEnum(EMAIL_TYPES)
  type: T

  @IsObject()
  @IsNotEmpty()
  @IsEmailInputValid()
  input: EmailTypeToInputMap[T]

  @IsArray()
  @IsOptional()
  receiverUserIds?: number[] = []
}
