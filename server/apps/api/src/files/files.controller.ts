import {
  Controller,
  Get,
  Header,
  Logger,
  Param,
  ParseArrayPipe,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { createCloseFileJobTask } from '@shared/queue'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { Response } from 'express'
import archiver from 'archiver'
import axios from 'axios'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { OptionalParseIntPipe } from '../validation/pipes/optional-int.pipe'

@UseGuards(UserContextGuard)
@Controller('/files')
export class FilesController {
  constructor(
    private readonly user: UserContext,
    private readonly log: Logger,
    private readonly userFileService: UserFileService,
  ) {}

  // Triggers job that closes file
  //   Note that the file uid (not dxid) is used here, e.g.
  //   /files/file-xxxx-1/close
  // https://confluence.internal.dnanexus.com/display/XVGEN/Closing+of+the+files
  @Patch('/:uid/close')
  async closeFile(@Param('uid') fileUid: string) {
    await createCloseFileJobTask({ ...{ fileUid } }, this.user)
  }

  @Get('bulk_download')
  @Header('Content-Type', 'application/octet-stream')
  async bulkDownload(
    @Query('id', new ParseArrayPipe({ items: Number })) ids: number[],
    @Res() res: Response,
    @Query('folder_id', new OptionalParseIntPipe()) folderId?: number,
  ) {
    const filesToBeDownloaded = await this.userFileService.composeFilesForBulkDownload(
      ids,
      folderId,
    )

    const zip = archiver('zip', { zlib: { level: 9 } })

    res.attachment(`pfda_archive_${filesToBeDownloaded.scope}_${this.getTimestamp()}.zip`)
    zip.pipe(res)

    let archiverError: Error | undefined
    zip.on('error', (err) => {
      this.log.error('archiver error', err)
      res.status(500).send(`Error creating zip: ${err?.message}`)
      archiverError = err
    })

    // Process each file one at a time
    for (const file of filesToBeDownloaded.files) {
      try {
        if (archiverError) break

        this.log.verbose(`Processing ${file.path} for bulk download url ${file.url}`)
        const response = await axios.get(file.url, { responseType: 'stream', timeout: 0 })

        // This is now awaited to ensure each stream is processed in turn
        await new Promise((resolve, reject) => {
          response.data.on('end', () => {
            resolve(true)
          })
          response.data.on('error', (error) => {
            reject(error)
          })
          zip.append(response.data, { name: file.path })
        })
      } catch (error) {
        res.status(500).send(`Error creating zip: ${error?.message}`)
        break
      }
    }

    await new Promise((resolve, reject) => {
      zip.on('error', reject)
      zip.on('finish', resolve) // Resolve the promise when the zip has finished writing
      zip.finalize()
    })
  }

  private getTimestamp() {
    const pad = (number: number) => (number < 10 ? '0' : '') + number
    const now = new Date()
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }
}
