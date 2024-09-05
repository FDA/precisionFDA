import { Injectable, PipeTransform } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ErrorCodes, ValidationError } from '@shared/errors'
import { aggregateSchemaErrors, formatAggregatedError } from '@shared/utils/aggregate-error'
import {
  getKeysDifferenceFromObject,
  validateNonNegativeInteger,
} from '@shared/validation/validators'

// TODO(samuel) This function is not 100% accurate in TS
// The return type of this fn is the same schema type
// This shouldn't affect resolved types, as utils.aggregateError.aggregateSchemaErrors depends
// Purely on function return types
// If 100% accuracy is wanted you can create similar generic to
// ResolveSchemaReturnTypes and apply it to this function
/**
 * @deprecated
 */

export function getAdminBodyValidationPipe<
  // TODO(samuel) make fieldPath array insted when reusing this schema builder
  ConfigT extends Record<string, (value: any, fieldPath: string, user?: UserContext) => void>,
>(bodyFieldConfig?: ConfigT) {
  @Injectable()
  class AdminBodyValidationPipe implements PipeTransform {
    constructor(readonly user: UserContext) {}

    transform(value: any) {
      const { errors: caughtErrors } = aggregateSchemaErrors(
        this.bindCtxArgument((val) => this.makeCloudGovBulkUserUpdateMiddlewareSchema(val), value),
      )
      if (caughtErrors.length > 0) {
        throw formatAggregatedError('Ctx validation failed', caughtErrors, {
          clientResponse: 'Validation Error',
          clientStatusCode: 400,
          code: ErrorCodes.VALIDATION,
          statusCode: 400,
        })
      }

      return value
    }

    bindCtxArgument<SchemaT>(schema: SchemaT, value: any): SchemaT {
      if (typeof schema === 'function') {
        // @ts-expect-error
        return () => schema(value)
      }
      if (Array.isArray(schema)) {
        return schema.map((entry) => this.bindCtxArgument(entry, value)) as any
      }
      if (typeof schema === 'object') {
        return Object.fromEntries(
          Object.entries(schema as any).map(([key, value]) => [
            key,
            this.bindCtxArgument(value, value),
          ]),
        ) as any
      }
      // Otherwise atomic value expected - string | number | boolean
      return schema
    }

    makeCloudGovBulkUserUpdateMiddlewareSchema<
      // TODO(samuel) make fieldPath array insted when reusing this schema builder
      ConfigT extends Record<string, (value: any, fieldPath: string, ctx?: Api.Ctx) => void>,
    >(value: any) {
      const bc = bodyFieldConfig
      const requiredProperties = ['ids'].concat(Object.keys(bc ?? {}))
      // @ts-ignore
      const { missingKeys, extraKeys } = getKeysDifferenceFromObject(
        value,
        requiredProperties,
      )
      if (missingKeys.length > 0) {
        throw new ValidationError(
          `Missing required properties from request body: ${JSON.stringify(missingKeys)}`,
        )
      }
      if (extraKeys.length > 0) {
        throw new ValidationError(
          `Request body contains extra keys: ${JSON.stringify(extraKeys)}`,
        )
      }
      // @ts-ignore
      if (value.ids.length === 0) {
        throw new ValidationError('No ids specified')
      }
      // @ts-ignore
      const invalidInputIds = value.ids.filter(
        (id: any) => !validateNonNegativeInteger(id),
      )
      if (invalidInputIds.length > 0) {
        throw new ValidationError(
          `Invalid input ids in request body: ${JSON.stringify(
            invalidInputIds,
          )}, expected positive integer`,
        )
      }
      // @ts-ignore
      Object.entries(bodyFieldConfig ?? {}).forEach(([key, validator]) =>
        validator(value[key], `ctx.request.body.${key}`, this.user),
      )
    }
  }

  return AdminBodyValidationPipe
}
