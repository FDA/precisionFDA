/* eslint-disable import/exports-last */
import type { JSONSchema7 } from 'json-schema'
import { isEmpty } from 'ramda'
import { errors, ajv, utils } from '@pfda/https-apps-shared'

type SanitizeInputFn = (props: any) => typeof props
type SchemaWithSource = {
  body?: JSONSchema7
  query?: JSONSchema7
  params?: JSONSchema7
}

export const makeSchemaValidationMdw = (schema: SchemaWithSource, sanitizeInput?: SanitizeInputFn) => {
  if (isEmpty(schema)) {
    throw new errors.InternalError('Empty schema spec passed to validation mdw.')
  }
  const validatorFunctions: AnyObject = {}
  if (schema.body) {
    validatorFunctions.body = ajv.compile(schema.body)
  }
  if (schema.params) {
    validatorFunctions.params = ajv.compile(schema.params)
  }
  if (schema.query) {
    validatorFunctions.query = ajv.compile(schema.query)
  }

  const sanitizeInputFn = sanitizeInput || (fields => fields)

  return (ctx: Api.Ctx, next: any) => {
    const results: AnyObject = {}
    Object.entries(validatorFunctions).forEach(([key, validationFn]) => {
      // @ts-ignore
      results[key] = validationFn(ctx.request[key])
      // fixme: just a proof of concept
      if (key === 'query') {
        // store differently
        ctx.validatedQuery = { ...ctx.request.query }
      }
    })
    const isValid = Object.values(results).every(validationResult => validationResult === true)

    if (!isValid) {
      const validationErrors: AnyObject = {}
      Object.entries(validatorFunctions).forEach(([key, fn]) => {
        if (fn.errors) {
          validationErrors[key] = fn.errors
        }
      })
      ctx.log.warn(
        {
          url: ctx.request.url,
          input: sanitizeInputFn(ctx.request.body),
          errors: validationErrors,
        },
        'Validation by schema failed',
      )
      throw new errors.ValidationError('Request body invalid', {
        code: errors.ErrorCodes.VALIDATION,
        statusCode: 400,
        validationErrors,
      })
    }
    ctx.log.debug(
      {
        url: ctx.request.url,
        input: sanitizeInputFn(ctx.request.body),
      },
      'Validation by schema passed',
    )
    return next()
  }
}

// TODO(samuel) This function is not 100% accurate in TS
// The return type of this fn is the same schema type
// This shouldn't affect resolved types, as utils.aggregateError.aggregateSchemaErrors depends
// Purely on function return types
// If 100% accuracy is wanted you can create similar generic to
// ResolveSchemaReturnTypes and apply it to this function
function bindCtxArgument<SchemaT>(schema: SchemaT, ctx: Api.Ctx): SchemaT {
  if (typeof schema === 'function') {
    // @ts-expect-error
    return () => schema(ctx)
  }
  if (Array.isArray(schema)) {
    return schema.map((entry) => bindCtxArgument(entry, ctx)) as any
  }
  if (typeof schema === 'object') {
    return Object.fromEntries(Object.entries(schema as any).map(([key, value]) => [
      key,
      bindCtxArgument(value, ctx)
    ])) as any
  }
  // Otherwise atomic value expected - string | number | boolean
  return schema
}

// TODO(samuel) investigate how applying middleware can deep-merge ctx type definitions
export const makeValidationMiddleware = <SchemaT extends any>(
  schema: SchemaT
) => (ctx: Api.Ctx, next: any) => {
  const { errors: caughtErrors } = utils.aggregateError.aggregateSchemaErrors(bindCtxArgument(schema, ctx))
  if (caughtErrors.length > 0) {
    throw utils.aggregateError.formatAggregatedError(
      'Ctx validation failed',
      caughtErrors,
      {
        clientResponse: 'Validation Error',
        clientStatusCode: 400,
        code: errors.ErrorCodes.VALIDATION,
      },
    )
  }
  return next()
}
