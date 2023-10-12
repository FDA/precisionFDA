import type { WorkerOpsCtx } from '@pfda/https-apps-shared/src/types'
import { createHash } from 'crypto'
import { PlatformClient } from '../../../platform-client'
import type { FileCreateParams } from '../../../platform-client/platform-client.params'
import type { UserOpsCtx } from '../../../types'
import type { UserFile } from '../../user-file'
import { FileCloseOperation } from '../../user-file'

export class PlatformFileService {
  private readonly CHUNK_SIZE = 50 * 1024 * 1024 // 50MB

  private readonly platformClient
  private readonly fileCloseOperation

  constructor(platformClient: PlatformClient, fileCloseOperation: FileCloseOperation) {
    this.platformClient = platformClient
    this.fileCloseOperation = fileCloseOperation
  }

  async createFile(params: FileCreateParams) {
    return await this.platformClient.fileCreate(params)
  }

  async deleteFiles(files: UserFile[]) {
    const projectsToFileDxids = files.reduce<Record<string, string[]>>((acc, file) => {
      if (!acc[file.project]) {
        acc[file.project] = []
      }

      acc[file.project].push(file.dxid)

      return acc
    }, {})

    const apiCalls = Object.keys(projectsToFileDxids)
      .map(project => this.platformClient.fileRemove({
        projectId: project,
        ids: projectsToFileDxids[project],
      }))

    await Promise.all(apiCalls)
  }

  async uploadFileContent(file: UserFile, content: string) {
    const chunks = this.getChunksFromString(content)

    await Promise.all(chunks.map((ch, i) => this.uploadChunk(file.dxid, ch, i)))

    await this.fileCloseOperation.execute({ id: file.uid, forceWaitForClose: true })
  }

  private async uploadChunk(fileUid: string, content: Buffer, index: number) {
    const { url, headers } = await this.getUploadURL(fileUid, content, index + 1)

    return fetch(url, {
      method: 'PUT',
      body: content,
      headers,
    })
  }

  private getChunksFromString(str: string) {
    const buffer = Buffer.from(str)
    const chunkBuffers: Buffer[] = []

    for (let start = 0; start < buffer.length; start += this.CHUNK_SIZE) {
      chunkBuffers.push(buffer.subarray(start, start + this.CHUNK_SIZE))
    }

    return chunkBuffers
  }

  private async getUploadURL(dxid: string, content: Buffer, index: number) {
    const md5 = createHash('md5').update(content).digest('hex')
    const size = content.byteLength

    return await this.platformClient.getFileUploadUrl({ dxid, index, md5, size })
  }

  // TODO - Remove with IOC
  static getInstance(userCtx: WorkerOpsCtx<UserOpsCtx>) {
    const client = new PlatformClient(userCtx.user.accessToken)
    const fileCloseOp = new FileCloseOperation(userCtx)

    return new PlatformFileService(client, fileCloseOp)
  }
}
