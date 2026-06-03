import { Uid } from '../domain/uid'

export class EntityUidResponseDTO {
  uid: Uid
  id?: Uid // for backward compatibility to old clients
}
