import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  Logger,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import { DownloadLinkOptionsDto } from '@shared/domain/entity/domain/download-link-options.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ResolvePathDTO } from '@shared/domain/user-file/dto/user-file.dto'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { createCloseFileJobTask } from '@shared/queue'
import { CustomValidationPipe } from '@shared/validation/pipes/validation.pipe'
import archiver from 'archiver'
import axios from 'axios'
import { Response } from 'express'
import { UserFileResolverFacade } from '../facade/user-file/user-file-resolver.facade'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { DownloadLinkParamDto } from './model/download-link-param.dto'
import { FilesValidateCopyingBodyDto } from './model/file-validate-copying-body.dto'
import { UserFileDownloadFacade } from '../facade/user-file/user-file-download.facade'
import {
  ExistingFileSet,
  ResolvePath,
  SelectedNode,
} from '@shared/domain/user-file/user-file.types'
import { TimeUtils } from '@shared/utils/time.utils'

@UseGuards(UserContextGuard)
@Controller('/files')
export class FilesController {
  constructor(
    private readonly user: UserContext,
    private readonly logger: Logger,
    private readonly userFileService: UserFileService,
    private readonly userFileResolverFacade: UserFileResolverFacade,
    private readonly userFileDownloadFacade: UserFileDownloadFacade,
  ) {}

  // Triggers job that closes file
  //   Note that the file uid (not dxid) is used here, e.g.
  //   /files/file-xxxx-1/close
  // https://confluence.internal.dnanexus.com/display/XVGEN/Closing+of+the+files
  // TODO - PFDA-6501
  @Patch('/:uid/close')
  async closeFile(@Param('uid') fileUid: string): Promise<void> {
    await createCloseFileJobTask({ ...{ fileUid } }, this.user)
  }

  @Get('bulk_download')
  @Header('Content-Type', 'application/octet-stream')
  async bulkDownload(
    @Query('id', new ParseArrayPipe({ items: Number })) ids: number[],
    @Res() res: Response,
    @Query('folder_id', new ParseIntPipe({ optional: true })) folderId?: number,
  ): Promise<void> {
    const filesToBeDownloaded = await this.userFileService.composeFilesForBulkDownload(
      ids,
      folderId,
    )

    const zip = archiver('zip', { zlib: { level: 9 } })

    res.attachment(`pfda_archive_${filesToBeDownloaded.scope}_${this.getTimestamp()}.zip`)
    zip.pipe(res)

    let archiverError: Error | undefined
    zip.on('error', (err) => {
      this.logger.error('archiver error', err)
      res.status(500).send(`Error creating zip: ${err?.message}`)
      archiverError = err
    })

    // Process each file one at a time
    // TODO - PFDA-6501
    for (const file of filesToBeDownloaded.files) {
      try {
        if (archiverError) break

        this.logger.log(`Processing file for bulk download url`)
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

  // TODO - PFDA-6501
  private getTimestamp(): string {
    const pad = (number: number) => (number < 10 ? '0' : '') + number
    const now = new Date()
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  }

  @UseGuards(InternalRouteGuard)
  @Get('/path-resolver')
  async resolvePath(
    @Query(new CustomValidationPipe({ transform: true })) query: ResolvePathDTO,
  ): Promise<ResolvePath> {
    return await this.userFileResolverFacade.resolvePath(query)
  }

  @Get('/selected')
  async getSelectedFiles(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[],
  ): Promise<SelectedNode[]> {
    return this.userFileService.listSelectedFiles(ids)
  }

  @Post('/copy/validate')
  async validateCopyFiles(@Body() body: FilesValidateCopyingBodyDto): Promise<ExistingFileSet> {
    return this.userFileService.validateCopyFiles(body.uids, body.scope)
  }

  @Get('/:uid/download-link')
  getDownloadLink(
    @Param() params: DownloadLinkParamDto,
    @Query() options: DownloadLinkOptionsDto,
  ): Promise<string> {
    return this.userFileDownloadFacade.getDownloadLink(params.uid, options)
  }

  @Get(':uid/:fileName')
  async downloadFile(
    @Param('uid') uid: Uid<'file'>,
    @Query('inline', new DefaultValuePipe(false), ParseBoolPipe) inline: boolean,
    @Res() res: Response,
  ): Promise<void> {
    const link = await this.userFileDownloadFacade.getDownloadLink(uid, {
      preauthenticated: true,
      inline,
      duration: TimeUtils.minutesToSeconds(5),
    })

    return res.redirect(link)
  }
}
