import { errors, validation } from '@pfda/https-apps-shared'

export const makeCloudGovBulkUserUpdateMiddlewareSchema = <
  // TODO(samuel) make fieldPath array insted when reusing this schema builder
  ConfigT extends Record<string, (value: any, fieldPath: string, ctx?: Api.Ctx) => void>
>(bodyFieldConfig?: ConfigT) => ({
  body: (ctx: Api.Ctx<{}, Partial<Record<'id' | keyof ConfigT, any>>>) => {
    const requiredProperties = ['ids'].concat(Object.keys(bodyFieldConfig ?? {}))
    // @ts-ignore
    const { missingKeys, extraKeys } = validation.validators.getKeysDifferenceFromObject(ctx.request.body, requiredProperties)
    if (missingKeys.length > 0) {
      throw new errors.ValidationError(`Missing required properties from request body: ${
        JSON.stringify(missingKeys)
      }`)
    }
    if (extraKeys.length > 0) {
      throw new errors.ValidationError(`Request body contains extra keys: ${
        JSON.stringify(extraKeys)
      }`)
    }
    // @ts-ignore
    if (ctx.request.body.ids.length === 0) {
      throw new errors.ValidationError('No ids specified')
    }
    // @ts-ignore
    const invalidInputIds = ctx.request.body.ids.filter((id: any) => !validation.validators.validateNonNegativeInteger(id))
    if (invalidInputIds.length > 0) {
      throw new errors.ValidationError(`Invalid input ids in request body: ${
        JSON.stringify(invalidInputIds)
      }, expected positive integer`)
    }
    // @ts-ignore
    Object.entries(bodyFieldConfig ?? {}).forEach(([key, validator]) => validator(ctx.request.body[key], `ctx.request.body.${key}`, ctx))
  },
})

// TODO(samuel) possibly reuse these utils
export const numericBodyValidator = (value: number, fieldPath: string) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new errors.ValidationError(`Invalid "${fieldPath}": ${
      value
    }, expected non-negative number`)
  }
}

export const enumValidator = <T extends string>(allowedValues: T[]) => (value: string, fieldPath: string) => {
  if (!allowedValues.includes(value as T)) {
    throw new Error(`Invalid "${fieldPath}" expected to be one of ${JSON.stringify(allowedValues)}`)
  }
}

export const arrayValidatorWrapper = <T>(
  innerValidator: (value: T, fieldPath: string, ctx?: Api.Ctx) => void,
) => (value: T[], fieldPath: string, ctx?: Api.Ctx) => {
  value.forEach((el, index) => innerValidator(el, `${fieldPath}[${index}]`, ctx))
}
