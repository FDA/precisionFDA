import type { JSONSchema7 } from 'json-schema'
import { isEmpty } from 'ramda'
import { errors, ajv } from '@pfda/https-apps-shared'

type SanitizeInputFn = (props: any) => typeof props
type SchemaWithSource = {
  body?: JSONSchema7
  query?: JSONSchema7
  params?: JSONSchema7
}

export const makeValidationMdw = (schema: SchemaWithSource, sanitizeInput?: SanitizeInputFn) => {
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

  return (ctx: Api.Ctx, next) => {
    const results: AnyObject = {}
    Object.entries(validatorFunctions).forEach(([key, validationFn]) => {
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
        'Validation failed',
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
      'Validation passed',
    )
    return next()
  }
}
