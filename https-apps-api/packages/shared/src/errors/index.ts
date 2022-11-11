/* eslint-disable import/group-exports, max-classes-per-file */

import type { AnyObject } from '../types'

type BaseErrorProps = AnyObject & {
  code: ErrorCodes
  statusCode?: number
  name?: string
  details?: AnyObject
}
type MaybeBaseErrorProps = Partial<BaseErrorProps>

// TODO(samuel) check if 'code' property can be omitted instead
export type ClientErrorProps = MaybeBaseErrorProps & {
  clientResponse: any
  clientStatusCode: number
}

// TODO(samuel) refactor into discriminated union type
export enum ErrorCodes {
  GENERIC = 'E_INTERNAL',
  WORKER = 'E_WORKER',
  VALIDATION = 'E_VALIDATION',
  NOT_FOUND = 'E_NOT_FOUND',
  NOT_PERMITTED = 'E_NOT_PERMITTED',
  INVALID_STATE = 'E_INVALID_STATE',
  // for specific situations
  USER_CONTEXT_QUERY_INVALID = 'E_USER_CONTEXT_QUERY_INVALID',
  JOB_NOT_FOUND = 'E_JOB_NOT_FOUND',
  APP_NOT_FOUND = 'E_APP_NOT_FOUND',
  PROJECT_NOT_FOUND = 'E_PROJECT_NOT_FOUND',
  FOLDER_NOT_FOUND = 'E_FOLDER_NOT_FOUND',
  USER_NOT_FOUND = 'E_USER_NOT_FOUND',
  USER_INVALID_PERMISSIONS = 'E_USER_INVALID_PERMISSIONS',
  USER_FILE_NOT_FOUND = 'E_USER_FILE_NOT_FOUND',
  SPACE_NOT_FOUND = 'E_SPACE_NOT_FOUND',
  NEXUS_REQUEST_FAILED = 'E_DNANEXUS_PLATFORM_REQUEST_FAILED',
  EMAIL_VALIDATION = 'E_EMAIL_VALIDATION',
  EMAIL_PAYLOAD_NOT_FOUND = 'E_EMAIL_PAYLOAD_NOT_FOUND',
  EXTERNAL_SERVICE_ERROR = 'E_EXTERNAL_SERVICE_FAILED',
  AWS_SES_SERVICE_ERROR = 'E_AWS_SES_SERVICE_FAILED',
  DB_CLUSTER_NOT_FOUND = 'E_DB_CLUSTER_NOT_FOUND',
  DB_CLUSTER_STATUS_MISMATCH = 'E_DB_CLUSTER_STATUS_MISMATCH',
  AGGREGATE_ERROR = 'E_AGGREGATE_ERROR',
  MFA_ALREADY_RESET = 'E_MFA_ALREADY_RESET',
  ORG_MEMBERSHIP_ERROR = 'E_ORG_MEMBERSHIP_ERROR',
  INVALID_IP_HEADER_ERROR = 'E_INVALID_IP_HEADER_ERROR'
}

export class BaseError extends Error {
  props: BaseErrorProps
  // props: Record<string, any> & { statusCode: number; code: ErrorCodes }

  constructor(message: string, props: BaseErrorProps) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.props = props
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

export class InvalidStateError extends BaseError {
  constructor(message = 'Error: Entity is in invalid state for the operation', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.INVALID_STATE,
      statusCode: 422,
      ...props,
    })
  }
}

export class PermissionError extends BaseError {
  constructor(message = 'Error: You do have permissions to access this entity', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.NOT_PERMITTED,
      statusCode: 403,
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

export class DbClusterNotFoundError extends NotFoundError {
  constructor(message = 'DB Cluster entity not found', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.DB_CLUSTER_NOT_FOUND,
      ...props,
    })
  }
}

export class DbClusterStatusMismatchError extends BaseError {
  constructor(message = 'DB Cluster status mismatched', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.DB_CLUSTER_STATUS_MISMATCH,
      statusCode: 400,
      ...props,
    })
  }
}

export class FileNotFoundError extends NotFoundError {
  constructor(message = 'Error: File not found', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.USER_FILE_NOT_FOUND,
      ...props,
    })
  }
}

export class FolderNotFoundError extends NotFoundError {
  constructor(message = 'Error: Folder not found', props: MaybeBaseErrorProps = {}) {
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

export class UserInvalidPermissionsError extends NotFoundError {
  constructor(message = 'Error: User invalid permissions', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.USER_NOT_FOUND,
      statusCode: 403,
      ...props,
    })
  }
}

export class SpaceNotFoundError extends NotFoundError {
  constructor(message = 'Error: Space not found', props: MaybeBaseErrorProps = {}) {
    super(message, {
      code: ErrorCodes.SPACE_NOT_FOUND,
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

export class MfaAlreadyResetError extends BaseError {
  constructor(
    message = 'MFA is already reset or not yet configured for the user',
    props: MaybeBaseErrorProps = {},
  ) {
    super(message, {
      code: ErrorCodes.MFA_ALREADY_RESET,
      statusCode: 400,
      ...props,
    })
  }
}

export class OrgMembershipError extends BaseError {
  constructor(
    message = 'Permission denied, must be a user of the org.',
    props: MaybeBaseErrorProps = {},
  ) {
    super(message, {
      code: ErrorCodes.ORG_MEMBERSHIP_ERROR,
      statusCode: 400,
      ...props,
    })
  }
}

export class InvalidIpHeaderError extends BaseError {
  constructor(
    message = 'Invalid IP Address',
    props: {
      validationError?: ValidationError
    } = {},
  ) {
    super(message, {
      code: ErrorCodes.INVALID_IP_HEADER_ERROR,
      validationError: props?.validationError,
    })
  }
}
