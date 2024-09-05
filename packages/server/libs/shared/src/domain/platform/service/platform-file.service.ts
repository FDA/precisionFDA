import { Injectable } from '@nestjs/common'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { createHash } from 'crypto'
import { PlatformClient } from '../../../platform-client'
import type { FileCreateParams } from '../../../platform-client/platform-client.params'

@Injectable()
export class PlatformFileService {
  private readonly CHUNK_SIZE = 50 * 1024 * 1024 // 50MB

  constructor(private readonly platformClient: PlatformClient) {}

  async createFile(params: FileCreateParams) {
    return await this.platformClient.fileCreate(params)
  }

  async uploadFileContent(file: UserFile, content: string) {
    const chunks = this.getChunksFromString(content)

    await Promise.all(chunks.map((ch, i) => this.uploadChunk(file.dxid, ch, i)))
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
    const buffer = Buffer.from(str ?? '')
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
}
