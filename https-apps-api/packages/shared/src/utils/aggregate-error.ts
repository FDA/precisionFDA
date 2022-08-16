import { BaseError, ClientErrorProps, ErrorCodes } from '../errors'
// import { ResolveSchemaReturnTypes } from './generics'
import { JsonPath } from './path'

// TODO(samuel) in node 15 and onwards we can subclass AggregateError
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError/AggregateError
// or polyfill with core-js
export class CustomAggregateError extends BaseError {
  private static appendNestedMessages(topMessage: string, nestedErrors: Array<{ error: BaseError, message: string }>) {
    return [
      topMessage,
      ...nestedErrors.map(({ message, error: { stack } }) => `${message}\n${stack}`),
      '--- Original Stacktrace of Aggregate Error ---',
    ].join('\n')
  }

  constructor(
    message: string,
    nestedErrors: Array<{ error: BaseError, message: string }>,
    props: ClientErrorProps,
  ) {
    super(CustomAggregateError.appendNestedMessages(message, nestedErrors), {
      code: ErrorCodes.AGGREGATE_ERROR,
      ...props,
    })
  }
}

type AggregatedErrorEntry = {
  error: BaseError
  message: string
  path: JsonPath
}

const resolveSchemaEffectsVisitor = <SchemaT extends any>(schema: SchemaT, caughtErrors: AggregatedErrorEntry[], path: Array<string | number>) => {
  if (typeof schema === 'function') {
    try {
      return schema()
    } catch (error) {
      if (error instanceof BaseError) {
        const message = error.message
        caughtErrors.push({ error, message, path })
      }
    }
    return null
  }
  if (Array.isArray(schema)) {
    return schema.map((entry, index) =>
      resolveSchemaEffectsVisitor(entry, caughtErrors, [...path, index])
    )
  }
  if (typeof schema === 'object') {
    return Object.fromEntries(Object.entries(schema as any).map(([key, value]) => [
      key,
      resolveSchemaEffectsVisitor(value, caughtErrors, [...path, key]),
    ]))
  }
  // Otherwise primitive value expected - string | number | boolean
  return schema
}

export const aggregateSchemaErrors = <SchemaT extends any>(schema: SchemaT) => {
  const errors: AggregatedErrorEntry[] = []
  const result = resolveSchemaEffectsVisitor(schema, errors, [])
  return {
    result,
    // Note correctly typed result is here, results in build-error
    // ResolveSchemaReturnTypes<SchemaT>,
    errors,
  }
}

export const formatAggregatedError = (
  topMessage: string,
  caughtErrors: AggregatedErrorEntry[],
  props: ClientErrorProps,
) =>
  new CustomAggregateError(
    topMessage,
    caughtErrors.map(({ error, message, path }) => ({
      error,
      message: `At "${path}" - ${message}`,
    })),
    props
  )
