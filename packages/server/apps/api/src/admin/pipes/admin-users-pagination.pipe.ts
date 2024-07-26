import { Injectable, Logger, PipeTransform } from '@nestjs/common'
import { BaseEntity } from '@shared/database/base-entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ValidationError } from '@shared/errors'
import {
  bindGetValueToSchema,
  createEnumFilter,
  FilterSchemaNode,
  MATCH_FILTER,
  NUMERIC_RANGE_FILTER,
} from '@shared/utils/filters'
import { MapValueObjectByKey, MapValuesToReturnType } from '@shared/utils/generics'
import { parseEnumValueFromString } from '@shared/validation/parsers'

type PaginationOpts<
  SortColumnT,
  FilterSchemaT extends Record<string, FilterSchemaNode>,
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

@Injectable()
export class AdminUsersPaginationPipe<
  T extends BaseEntity,
  SortColumnT extends string = Extract<keyof T, string>,
  FilterSchemaT extends Partial<Record<string, FilterSchemaNode>> = Partial<
    Record<Extract<keyof T, string>, FilterSchemaNode>
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
        dxuser: MATCH_FILTER,
        email: MATCH_FILTER,
        // :D
        userState: createEnumFilter(['0', '1', '2']),
        lastLogin: MATCH_FILTER,
        totalLimit: NUMERIC_RANGE_FILTER,
        jobLimit: NUMERIC_RANGE_FILTER,
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
  private readonly orderByParser = parseEnumValueFromString<
    Extract<(typeof this.opts)['sort']['sortableColumns'][number], string>
  >(
    this.sortableColums as any,
    (value) => `"order_by" param was "${value}", expected ${JSON.stringify(this.sortableColums)}`,
  )
  private readonly orderDirParser = parseEnumValueFromString(
    ['ASC', 'DESC'],
    (value) => `"order_dir" param was "${value}", expected to be either "ASC" or "DESC"`,
  )

  constructor(
    private readonly logger: Logger,
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
        throw new ValidationError('"page" and "per_page" parameters were null')
      case isPageInvalid:
        throw new ValidationError('"page" parameter was null')
      case isPerPageInvalid:
        throw new ValidationError('"per_page" parameter was null')
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
        bindGetValueToSchema(
          (key) => value.filters?.[key]?.toString(),
          (this.opts?.filter?.schema ?? {}) as FilterSchemaT,
        ),
      ).map(([schemaKey, schemaValue]) => [schemaKey, schemaValue.parser(schemaKey)]),
    ) as MapValuesToReturnType<
      MapValuesToReturnType<
        MapValueObjectByKey<'parser', FilterSchemaT>
      >
    >

    this.logger.debug({ userId: this.user.id }, 'Pagination params parsed')

    return {
      page,
      perPage,
      orderBy,
      orderDir,
      filters,
    }
  }
}
