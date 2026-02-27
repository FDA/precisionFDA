/**
 * API request functions for file upload operations
 */

import { ChunkUploadError, CreateFileError } from './errors'
import type { UploadUrlResponse, WorkerSession } from './types'
import { cleanObject, toError } from './utils'

function buildRequestHeaders(csrfToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  return headers
}

/**
 * Create a new file on the server
 */
export async function createFileRequest(session: WorkerSession): Promise<void> {
  const data = cleanObject({
    name: session.fileName,
    scope: session.scope,
    folder_id: session.folderId,
    space_id: session.spaceId,
    home_scope: session.homeScope,
  })

  const controller = new AbortController()
  session.currentControllers.add(controller)

  try {
    const response = await fetch('/api/create_file', {
      method: 'POST',
      headers: buildRequestHeaders(session.csrfToken),
      body: JSON.stringify(data),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new CreateFileError(`Failed to create file: ${response.statusText}`, response.status)
    }

    const result = await response.json()

    if (result.message?.type === 'error') {
      const errorText = Array.isArray(result.message.text) ? result.message.text.join(', ') : result.message.text
      throw new CreateFileError(errorText)
    }

    if (!result.id) {
      throw new CreateFileError('No file ID returned from create_file API')
    }

    session.fileUid = result.id
  } catch (error) {
    // If the error is an AbortError, convert it to a cancellation error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(session.cancelMessage ?? 'Upload cancelled')
    }
    throw error
  } finally {
    // Clean up the controller
    session.currentControllers.delete(controller)
  }
}

/**
 * Request a pre-signed URL for chunk upload
 */
export async function requestUploadUrl(
  session: WorkerSession,
  chunkIndex: number,
  size: number,
  hash: string,
  signal: AbortSignal,
): Promise<UploadUrlResponse> {
  try {
    // Build URL with query parameters
    const params = new URLSearchParams({
      index: String(chunkIndex + 1),
      size: String(size),
      md5: hash,
    })
    const url = `/api/v2/files/${session.fileUid}/upload-url?${params.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    })

    if (!response.ok) {
      throw new ChunkUploadError(
        `Failed to get upload URL for chunk ${chunkIndex}: ${response.statusText}`,
        chunkIndex,
        response.status,
      )
    }

    const payload = await response.json()

    if (payload?.error?.message) {
      throw new ChunkUploadError(
        `Failed to get upload URL for chunk ${chunkIndex}: ${payload.error.message}`,
        chunkIndex,
        response.status,
      )
    }

    const { url: uploadUrl, headers } = payload as UploadUrlResponse
    return { url: uploadUrl, headers }
  } catch (error) {
    // If the error is an AbortError, convert it to a cancellation error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(session.cancelMessage ?? 'Upload cancelled')
    }
    if (error instanceof ChunkUploadError) {
      throw error
    }
    throw new ChunkUploadError(
      `Failed to get upload URL for chunk ${chunkIndex}: ${toError(error).message}`,
      chunkIndex,
    )
  }
}

/**
 * Close a file after all chunks are uploaded
 */
export async function closeFileRequest(uid: string, csrfToken?: string): Promise<void> {
  const response = await fetch(`/api/v2/files/${uid}/close`, {
    method: 'PATCH',
    headers: buildRequestHeaders(csrfToken),
  })

  if (!response.ok) {
    throw new Error(`Failed to close file: ${response.statusText}`)
  }
}
