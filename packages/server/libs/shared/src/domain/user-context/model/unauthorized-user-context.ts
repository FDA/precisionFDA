import { UserContext } from '@shared/domain/user-context/model/user-context'

export class UnauthorizedUserContext extends UserContext {
  constructor() {
    super(null, null, null)
  }
}
