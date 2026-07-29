import { Matches } from 'class-validator'

export class UserGetParamsDTO {
  @Matches(/^(\d+|[a-zA-Z0-9_.-]{1,255})$/, {
    message: 'idOrDxuser must be a numeric id or a valid dxuser',
  })
  idOrDxuser: string
}
