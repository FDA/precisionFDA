import { Transform } from 'class-transformer'

/**
 * Remaps client-facing sort key aliases to their ORM equivalents at deserialization time.
 *
 * Pass a map of alias → dot-notation ORM path. The sort direction is preserved and applied
 * to the deepest key of the resolved path.
 *
 * @example
 * // 'addedBy' in the request becomes { user: { dxuser: <dir> } }
 * @TransformSortKeys({ addedBy: 'user.dxuser' })
 * sort: SortDefinition<UserFile> = { createdAt: QueryOrder.DESC }
 */
export function TransformSortKeys(keyMap: Record<string, string>): PropertyDecorator {
  return Transform(({ value }) => {
    if (!value || typeof value !== 'object') return value

    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [key, dir]) => {
        const ormPath = keyMap[key]
        if (!ormPath) {
          acc[key] = dir
          return acc
        }
        const nested = ormPath.split('.').reduceRight<unknown>((v, k) => ({ [k]: v }), dir)
        return Object.assign(acc, nested)
      },
      {} as Record<string, unknown>,
    )
  })
}
