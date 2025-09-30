import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { Uid, UidAbleEntityType } from '@shared/domain/entity/domain/uid'

export interface SearchableByUid<T extends UidAbleEntityType> {
  getAccessibleEntityByUid(uid: Uid<T>): Promise<EntityInstance<T> | null>
  getEditableEntityByUid(uid: Uid<T>): Promise<EntityInstance<T> | null>
}
