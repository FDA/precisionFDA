/**
 * Custom error classes for upload operations
 */

/**
 * Error thrown when file creation fails on the server
 */
export class CreateFileError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message)
    this.name = 'CreateFileError'
  }
}

/**
 * Error thrown when a chunk upload fails
 */
export class ChunkUploadError extends Error {
  constructor(
    message: string,
    public readonly chunkIndex?: number,
    public readonly statusCode?: number,
  ) {
    super(message)
    this.name = 'ChunkUploadError'
  }
}

/**
 * Error thrown when an operation is aborted/cancelled
 */
export class CancelledError extends Error {
  constructor(message = 'Upload cancelled') {
    super(message)
    this.name = 'CancelledError'
  }
}
