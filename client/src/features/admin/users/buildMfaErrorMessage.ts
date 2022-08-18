import { itemsCountString } from '../../../utils/formatting'

type Result =
  | {
    status: 'success'
    value: any
  }
  | {
    status: 'handledError'
    errorType: string
    message: string
  }
  | {
    status: 'unhandledError'
    error: any
  }
export type ResponseShape<ResultT extends Result> = {
  dxuser: string
  result: ResultT
}

export const buildMessageFromMfaResponse = (userEntries: ResponseShape<Result>[]) => {
  if (userEntries.every(({ result }) => result.status === 'success')) {
    return { success: true, message: 'MFA successfully reset' }
  }
  const successfulResponses = userEntries.filter(({ result }) => result.status === 'success') as ResponseShape<Extract<Result, { status: 'success' }>>[]
  const handledErrorResponses = userEntries.filter(({ result }) => result.status === 'handledError') as ResponseShape<Extract<Result, { status: 'handledError' }>>[]
  const unhandledErrorResponses = userEntries.filter(({ result }) => result.status === 'unhandledError') as ResponseShape<Extract<Result, { status: 'unhandledError' }>>[]
  const shouldDisplayError = unhandledErrorResponses.length > 0
  const handledErrorsDict: Record<string, {
    message: string
    users: Array<string>
  }> = {}
  handledErrorResponses.forEach(({ result, dxuser }) => {
    if (!(result.errorType in handledErrorsDict)) {
      handledErrorsDict[result.errorType] = {
        message: result.message,
        users: [] as string[],
      }
    }
    handledErrorsDict[result.errorType].users.push(dxuser)
  })

  let finalMessages = successfulResponses.length > 0 ? [
    `${successfulResponses.length} user MFA requests were successful`,
  ] : []
  finalMessages = finalMessages.concat(Object.entries(handledErrorsDict).map(([errorType, { message, users }]) => `${itemsCountString('user', users.length)} encountered "${errorType}", with message "${message}" - Impacted ${itemsCountString('user', users.length)}`))
  if (unhandledErrorResponses.length > 0) {
    finalMessages = finalMessages.concat([
      `${itemsCountString('user', unhandledErrorResponses.length)} encountered unhandled server error - ${unhandledErrorResponses.map(({ dxuser: user }) => `"${user}"`).join(', ')}`,
    ])
  }
  return {
    success: !shouldDisplayError,
    message: finalMessages.join('\n---\n'),
  }
}
