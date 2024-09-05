import { STATIC_SCOPE } from "../../enums"
import { getScopeFromSpaceId } from "../space/space.helper"


export interface FilterableQueryInput {
  scope?: string,
  spaceId?: number,
  userId?: number,
}

const queryRegistry = {
  scopePrivate: () => { return { scope: STATIC_SCOPE.PRIVATE } },
  scopePublic: () => { return { scope: STATIC_SCOPE.PUBLIC } },
  scopeSpace: (spaceId: number) => {
    return { scope: getScopeFromSpaceId(spaceId) }
  },
}

export const buildEntityQueryAndFilter = (input: FilterableQueryInput): [{}, {}] => {
  let query = {}
  let filters = {} as any
  if (input.userId) {
    filters['ownedBy'] = { userId: input.userId }
  }

  if (input.spaceId) {
    query = {...query, ...queryRegistry.scopeSpace(input.spaceId)}
  }
  else if (input.scope) {
    switch (input.scope) {
      case STATIC_SCOPE.PRIVATE:
        query = {...query, ...queryRegistry.scopePrivate()}
        break
      case STATIC_SCOPE.PUBLIC:
        query = {...query, ...queryRegistry.scopePublic()}
        break
    }
  }

  return [query, filters]
}
