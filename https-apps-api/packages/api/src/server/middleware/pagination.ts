import { errors, utils, validation, BaseEntity } from '@pfda/https-apps-shared'

type PaginationOpts<
  SortColumnT,
  FilterSchemaT extends Record<string, utils.filters.FilterSchemaNode>,
> = Partial<{
  pagination: {
    defaultPerPage?: number
    defaultPage?: number
  },
  sort: {
    sortableColumns: SortColumnT[]
    isOrderByMandatory?: boolean
    // TODO(samuel) unify typescript types
    defaultOrderDir?: 'ASC' | 'DESC'
  },
  filter: {
    schema: FilterSchemaT
    keyMapper?: (key: string) => string
  }
}>

const DEFAULT_PER_PAGE = 20
const DEFAULT_PAGE = 1

const defaultKeyMapper = (key: string) => `filters[${key}]`

// Typescript Usage for this middleware
// const router = new Router<DefaultState, Api.Ctx<{
//   pagination: {
//     enabled: true
//     paginatedEntity: User
//     sortColumn: keyof User
//     filterSchema: Record<keyof User, 'string'>
//   }>>()
// router.use(makePaginationParseMdw)

export const makePaginationParseMdw =
<
  T extends BaseEntity,
  SortColumnT extends string = Extract<keyof T, string>,
  FilterSchemaT extends Partial<Record<string, utils.filters.FilterSchemaNode>> = Partial<Record<Extract<keyof T, string>, utils.filters.FilterSchemaNode>>,
>
// @ts-ignore
(opts?: PaginationOpts<SortColumnT, FilterSchemaT>) => {
  const defaultPage = opts?.pagination?.defaultPage ?? DEFAULT_PAGE
  const defaultPerPage = opts?.pagination?.defaultPerPage ?? DEFAULT_PER_PAGE
  const defaultOrderDir = opts?.sort?.defaultOrderDir ?? 'ASC'
  const sortableColums = opts?.sort?.sortableColumns ?? []
  const filterKeyMapper = opts?.filter?.keyMapper ?? defaultKeyMapper
  // @ts-ignore
  const orderByParser = validation.parsers.parseEnumValueFromString<Extract<typeof opts['sort']['sortableColumns'][number], string>>(sortableColums as any, (value) => `"order_by" param was "${value}", expected ${JSON.stringify(sortableColums)}`)
  const orderDirParser = validation.parsers.parseEnumValueFromString(['ASC', 'DESC'], (value) => `"order_dir" param was "${value}", expected to be either "ASC" or "DESC"`)

  // @ts-ignore
  return (ctx: Api.Ctx<{pagination: {
    enabled: true
    paginatedEntity: T,
    sortColumn: SortColumnT,
    filterSchema: FilterSchemaT,
  }}>, next: any) => {
    const pageFromQuery = ctx.query.page?.toString()
    const perPageFromQuery = ctx.query.per_page?.toString()
    const page = (pageFromQuery && parseInt(pageFromQuery, 10)) ?? defaultPage;
    const perPage = (perPageFromQuery && parseInt(perPageFromQuery, 10)) ?? defaultPerPage 
    const isPageInvalid = page < 1
    const isPerPageInvalid = perPage < 1
    switch (true) {
      case isPageInvalid && isPerPageInvalid:
        throw new errors.ValidationError('"page" and "per_page" parameters were null')
      case isPageInvalid:
        throw new errors.ValidationError('"page" parameter was null')
      case isPerPageInvalid:
        throw new errors.ValidationError('"per_page" parameter was null')
      default:
        break
    }

    // TODO(samuel) fix for array parameter parsing
    const orderByFromQuery = ctx.query.order_by?.toString()
    const shouldValidateOrderBy = Boolean(orderByFromQuery) || Boolean(opts?.sort?.isOrderByMandatory)
    const orderBy = shouldValidateOrderBy ? orderByParser(orderByFromQuery) : null

    const orderDirFromQuery = ctx.query.order_dir?.toString()
    const orderDir = orderDirFromQuery ? orderDirParser(orderDirFromQuery) : defaultOrderDir

    const filters = Object.fromEntries(
      Object.entries(
        utils.filters.bindGetValueToSchema(
          (key) => ctx.query[filterKeyMapper(key)]?.toString(),
          // @ts-ignore
          (opts?.filter?.schema ?? {}) as FilterSchemaT
        ),
        // @ts-ignore
      ).map(([schemaKey, schemaValue]) => [schemaKey, schemaValue.parser(schemaKey)])
      // @ts-ignore
    ) as utils.generics.MapValuesToReturnType<utils.generics.MapValuesToReturnType<utils.generics.MapValueObjectByKey<'parser', FilterSchemaT>>>

    ctx.pagination = {
      page,
      perPage,
      orderBy,
      orderDir,
      filters,
    }
    ctx.log.debug({ userId: ctx.user!.id }, 'Pagination params parsed')
    return next()
  }
}

// TODO(samuel) handling of case when extra url param is added
