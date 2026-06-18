import { Uid } from '@shared/domain/entity/domain/uid'

export class UserFileAccessibleResultDTO {
  valid: Uid<'file'>[]
  invalid: Uid<'file'>[]
}
