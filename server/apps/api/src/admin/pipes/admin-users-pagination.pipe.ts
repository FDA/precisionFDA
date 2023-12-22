import { Injectable, Logger, PipeTransform } from '@nestjs/common'
import { BaseEntity, errors, UserContext, utils, validation } from '@shared'

type PaginationOpts<
  SortColumnT,
  FilterSchemaT extends Record<string, utils.filters.FilterSchemaNode>,
> = Partial<{
  pagination: {
    defaultPerPage?: number
    defaultPage?: number
  }
  sort: {
    sortableColumns: SortColumnT[]
    isOrderByMandatory?: boolean
    // TODO(samuel) unify typescript types
    defaultOrderDir?: 'ASC' | 'DESC'
  }
  filter: {
    schema: FilterSchemaT
    keyMapper?: (key: string) => string
  }
}>

const DEFAULT_PER_PAGE = 20
const DEFAULT_PAGE = 1

const defaultKeyMapper = (key: string) => `filters[${key}]`

@Injectable()
export class AdminUsersPaginationPipe<
  T extends BaseEntity,
  SortColumnT extends string = Extract<keyof T, string>,
  FilterSchemaT extends Partial<Record<string, utils.filters.FilterSchemaNode>> = Partial<
    Record<Extract<keyof T, string>, utils.filters.FilterSchemaNode>
  >,
> implements PipeTransform
{
  private readonly opts = {
    sort: {
      isOrderByMandatory: false,
      sortableColumns: [
        // 'id' as const,
        'dxuser' as const,
        'email' as const,
        'lastLogin' as const,
        'userState' as const,
        'totalLimit' as const,
        'jobLimit' as const,
      ],
    },
    pagination: {
      defaultPerPage: 50,
    },
    filter: {
      schema: {
        dxuser: utils.filters.MATCH_FILTER,
        email: utils.filters.MATCH_FILTER,
        // :D
        userState: utils.filters.createEnumFilter(['0', '1', '2']),
        lastLogin: utils.filters.MATCH_FILTER,
        totalLimit: utils.filters.NUMERIC_RANGE_FILTER,
        jobLimit: utils.filters.NUMERIC_RANGE_FILTER,
      },
    },
  }

  // @ts-ignore
  private readonly defaultPage = this.opts?.pagination?.defaultPage ?? DEFAULT_PAGE
  private readonly defaultPerPage = this.opts?.pagination?.defaultPerPage ?? DEFAULT_PER_PAGE
  // @ts-ignore
  private readonly defaultOrderDir = this.opts?.sort?.defaultOrderDir ?? 'ASC'
  private readonly sortableColums = this.opts?.sort?.sortableColumns ?? []
  // @ts-ignore
  private readonly filterKeyMapper = this.opts?.filter?.keyMapper ?? defaultKeyMapper
  private readonly orderByParser = validation.parsers.parseEnumValueFromString<
    Extract<(typeof this.opts)['sort']['sortableColumns'][number], string>
  >(
    this.sortableColums as any,
    (value) => `"order_by" param was "${value}", expected ${JSON.stringify(this.sortableColums)}`,
  )
  private readonly orderDirParser = validation.parsers.parseEnumValueFromString(
    ['ASC', 'DESC'],
    (value) => `"order_dir" param was "${value}", expected to be either "ASC" or "DESC"`,
  )

  constructor(
    private readonly log: Logger,
    private readonly user: UserContext,
  ) {}

  transform(value: any) {
    const pageFromQuery = value.page?.toString()
    const perPageFromQuery = value.per_page?.toString()
    const page = (pageFromQuery && parseInt(pageFromQuery, 10)) ?? this.defaultPage
    const perPage = (perPageFromQuery && parseInt(perPageFromQuery, 10)) ?? this.defaultPerPage
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
    const orderByFromQuery = value.order_by?.toString()
    const shouldValidateOrderBy =
      Boolean(orderByFromQuery) || Boolean(this.opts?.sort?.isOrderByMandatory)
    const orderBy = shouldValidateOrderBy ? this.orderByParser(orderByFromQuery) : null

    const orderDirFromQuery = value.order_dir?.toString()
    const orderDir = orderDirFromQuery
      ? this.orderDirParser(orderDirFromQuery)
      : this.defaultOrderDir

    const filters = Object.fromEntries(
      Object.entries(
        utils.filters.bindGetValueToSchema(
          (key) => value[this.filterKeyMapper(key)]?.toString(),
          (this.opts?.filter?.schema ?? {}) as FilterSchemaT,
        ),
      ).map(([schemaKey, schemaValue]) => [schemaKey, schemaValue.parser(schemaKey)]),
    ) as utils.generics.MapValuesToReturnType<
      utils.generics.MapValuesToReturnType<
        utils.generics.MapValueObjectByKey<'parser', FilterSchemaT>
      >
    >

    this.log.debug({ userId: this.user.id }, 'Pagination params parsed')

    return {
      page,
      perPage,
      orderBy,
      orderDir,
      filters,
    }
  }
}
