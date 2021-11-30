/* eslint-disable import/group-exports, max-classes-per-file */

import type { AnyObject } from '../types'

type BaseErrorProps = AnyObject & {
  code: ErrorCodes
  statusCode?: number
  name?: string
  details?: AnyObject
}
type MaybeBaseErrorProps = Partial<BaseErrorProps>
type ClientErrorProps = MaybeBaseErrorProps & {
  clientResponse: any
  clientStatusCode: number
}

export enum ErrorCodes {
  GENERIC = 'E_INTERNAL',
  WORKER = 'E_WORKER',
  VALIDATION = 'E_VALIDATION',
  NOT_FOUND = 'E_NOT_FOUND',
  // for specific situations
  USER_CONTEXT_QUERY_INVALID = 'E_USER_CONTEXT_QUERY_INVALID',
  JOB_NOT_FOUND = 'E_JOB_NOT_FOUND',
  APP_NOT_FOUND = 'E_APP_NOT_FOUND',
  PROJECT_NOT_FOUND = 'E_PROJECT_NOT_FOUND',
  FOLDER_NOT_FOUND = 'E_FOLDER_NOT_FOUND',
  USER_NOT_FOUND = 'E_USER_NOT_FOUND',
  USER_FILE_NOT_FOUND = 'E_USER_FILE_NOT_FOUND',
  SPACE_NOT_FOUND = 'E_SPACE_NOT_FOUND',
  NEXUS_REQUEST_FAILED = 'E_DNANEXUS_PLATFORM_REQUEST_FAILED',
  EMAIL_VALIDATION = 'E_EMAIL_VALIDATION',
  EMAIL_PAYLOAD_NOT_FOUND = 'E_EMAIL_PAYLOAD_NOT_FOUND',
  EXTERNAL_SERVICE_ERROR = 'E_EXTERNAL_SERVICE_FAILED',
  SALESFORCE_SERVICE_ERROR = 'E_SALESFORCE_SERVICE_FAILED',
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

export class WorkerError extends BaseError {
  constructor(message = 'Error: Worker processing failed', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.WORKER,
      ...props,
    })
  }
}

export class InternalError extends BaseError {
  constructor(message = 'Error: Internal error', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.GENERIC,
      statusCode: 500,
      ...props,
    })
  }
}

export class NotFoundError extends BaseError {
  constructor(message = 'Error: Entity not found', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.NOT_FOUND,
      statusCode: 404,
      ...props,
    })
  }
}

export class ValidationError extends BaseError {
  constructor(
    message = 'Error: Validation failed',
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
  constructor(message = 'Error: Job entity not found', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.JOB_NOT_FOUND,
      ...props,
    })
  }
}

export class FolderNotFoundError extends NotFoundError {
  constructor(message = 'Error: Folder entity not found', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.FOLDER_NOT_FOUND,
      ...props,
    })
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(message = 'Error: User entity not found', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.USER_NOT_FOUND,
      ...props,
    })
  }
}

export class ClientRequestError extends BaseError {
  constructor(message: string, props: ClientErrorProps) {
    super(message, {
      code: ErrorCodes.NEXUS_REQUEST_FAILED,
      statusCode: 400,
      ...props,
    })
  }
}

export class ServiceError extends BaseError {
  constructor(message: string, props: ClientErrorProps) {
    super(message, {
      code: ErrorCodes.EXTERNAL_SERVICE_ERROR,
      statusCode: 400,
      ...props,
    })
  }
}
