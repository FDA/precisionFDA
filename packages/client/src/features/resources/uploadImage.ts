import axios from 'axios'
import httpStatusCodes from 'http-status-codes'
import sparkMD5 from 'spark-md5'
import { GetUploadURLResponse } from './resources.types'

export const CHUNK_SIZE = 100 * 1024 ** 2 // 100Mb

const throwIfError = (status: number, payload?: any) => {
  if (status !== httpStatusCodes.OK) {
    const errorMessage = payload?.error?.message ?? 'Unknown upload failure'
    throw new Error(errorMessage)
  }
}


const getUploadURL = (id: string, index: number, size: number, md5: string) =>
  axios.post('/api/get_upload_url', { id, index, size, md5 }).then(r => ({ payload: r.data as GetUploadURLResponse, status: r.status }))

const uploadChunk = (url: string, chunk: ArrayBuffer, headers: any) => (
  fetch(url, {
    method: 'PUT',
    body: chunk,
    headers,
  })
)

const closeFile = (uid: string, followUpAction?: string) => axios.post('/api/close_file', {
  uid,
  followUpAction,
})

function getNumChunks(file: File) {
  return Math.ceil(file.size / CHUNK_SIZE)
}

async function processChunk(file: File, fileUid: string, chunkIndex: number, reader: FileReader, spark: sparkMD5.ArrayBuffer) {
  const firstByte = chunkIndex * CHUNK_SIZE
  const lastByte = (chunkIndex + 1) * CHUNK_SIZE

  if (reader.result) {
    const buffer = reader.result.slice(firstByte, lastByte) as ArrayBuffer
    spark.append(buffer)
    const hash = spark.end()

    const { status, payload } = await getUploadURL(fileUid, chunkIndex + 1, buffer.byteLength, hash)
    throwIfError(status, payload)

    const { url, headers } = payload
    const res = await uploadChunk(url, buffer, headers)
    throwIfError(res.status)
  }
}

function readAndProcessFile(file: File, fileUid: string) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader()
    const spark = new sparkMD5.ArrayBuffer()

    reader.onload = async () => {
      const promises = Array.from({ length: getNumChunks(file) }, (_, i) =>
        processChunk(file, fileUid, i, reader, spark),
      )

      try {
        await Promise.all(promises)
        resolve()
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = err => reject(err)
    reader.readAsArrayBuffer(file)
  })
}

export async function processFile(file: File, fileUid: string) {
  await readAndProcessFile(file, fileUid)
  await closeFile(fileUid)
}
