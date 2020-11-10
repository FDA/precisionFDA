/* eslint-disable import/group-exports, max-classes-per-file */

import type { AnyObject } from '../types'

type BaseErrorProps = AnyObject & {
  code: ErrorCodes
  statusCode: number
  name?: string
}
type MaybeBaseErrorProps = Partial<BaseErrorProps>

export enum ErrorCodes {
  GENERIC = 'E_INTERNAL',
  VALIDATION = 'E_VALIDATION',
  NOT_FOUND = 'E_NOT_FOUND',
  // for specific situations
  USER_CONTEXT_QUERY_INVALID = 'E_USER_CONTEXT_QUERY_INVALID',
  JOB_NOT_FOUND = 'E_JOB_NOT_FOUND',
  NEXUS_REQUEST_FAILED = 'E_DNANEXUS_PLATFORM_REQUEST_FAILED',
}

export class BaseError extends Error {
  props: BaseErrorProps
  // props: Record<string, any> & { statusCode: number; code: ErrorCodes }

  constructor(message: string, props: BaseErrorProps) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.props = {
      ...props,
      name: this.name,
    }
  }
}

export class InternalError extends BaseError {
  constructor(message = 'Internal error', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.GENERIC,
      statusCode: 500,
      ...props,
    })
  }
}

export class NotFoundError extends BaseError {
  constructor(message = 'Entity not found', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.NOT_FOUND,
      statusCode: 404,
      ...props,
    })
  }
}

export class ValidationError extends BaseError {
  constructor(
    message = 'Validation failed',
    props: MaybeBaseErrorProps & { validationErrors?: any } = {},
  ) {
    super(message, {
      code: ErrorCodes.VALIDATION,
      statusCode: 400,
      ...props,
    })
  }
}

export class JobNotFoundError extends NotFoundError {
  constructor(message = 'Job entity not found', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.JOB_NOT_FOUND,
      ...props,
    })
  }
}

export class ClientRequestError extends BaseError {
  constructor(message = 'Client API call failed', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.NEXUS_REQUEST_FAILED,
      statusCode: 400,
      ...props,
    })
  }
}
