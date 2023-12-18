/* eslint-disable multiline-ternary */
export const classifyErrorTypes = <ErrorConstructorT extends Function, ResultT>(handledErrors: ErrorConstructorT[], result: PromiseSettledResult<ResultT>) => {
  switch (result.status) {
    case 'fulfilled':
      return {
        status: 'success' as const,
        value: result.value,
      }
    case 'rejected':
    default:
      return handledErrors.some(handledError => result.reason instanceof handledError) ? {
        status: 'handledError' as const,
        errorType: result.reason.name,
        message: result.reason.message,
      } : {
        status: 'unhandledError' as const,
        error: result.reason,
      }
  }
}
