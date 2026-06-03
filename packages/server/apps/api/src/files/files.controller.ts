import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  Headers,
  HttpCode,
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
  UsePipes,
} from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import archiver from 'archiver'
import axios from 'axios'
import { compareVersions } from 'compare-versions'
import { Response } from 'express'
import { DownloadLinkOptionsDTO } from '@shared/domain/entity/domain/download-link-options.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityUidResponseDTO } from '@shared/domain/entity/dto/entity-uid-response.dto'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FileGetDTO } from '@shared/domain/user-file/dto/file-get.dto'
import { ResolvePathDTO } from '@shared/domain/user-file/dto/user-file.dto'
import { UserFileCreateDTO } from '@shared/domain/user-file/dto/user-file-create.dto'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UrlFetchService } from '@shared/domain/user-file/service/url-fetch.service'
import { ExistingFileSet, ResolvePath, SelectedNode } from '@shared/domain/user-file/user-file.types'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'
import { GetUploadURLResponse } from '@shared/platform-client/platform-client.responses'
import { createCloseFileJobTask } from '@shared/queue'
import { TimeUtils } from '@shared/utils/time.utils'
import { SnakeToCamelPipe } from '@shared/validation/pipes/snake-to-camel.pipe'
import { CustomValidationPipe } from '@shared/validation/pipes/validation.pipe'
import { UserFileBulkDownloadFacade } from '../facade/user-file/user-file-bulk-download.facade'
import { UserFileDownloadFacade } from '../facade/user-file/user-file-download.facade'
import { UserFileGetFacade } from '../facade/user-file/user-file-get.facade'
import { UserFileResolverFacade } from '../facade/user-file/user-file-resolver.facade'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { FileUidParamDTO } from './model/file-uid-param.dto'
import { FilesValidateCopyingBodyDTO } from './model/file-validate-copying-body.dto'
import { GetUploadUrlQueryDTO } from './model/get-upload-url-query.dto'

@UseGuards(UserContextGuard)
@Controller('/files')
export class FilesController {
  constructor(
    private readonly user: UserContext,
    private readonly logger: Logger,
    private readonly nodeService: NodeService,
    private readonly urlFetchService: UrlFetchService,
    private readonly userFileResolverFacade: UserFileResolverFacade,
    private readonly userFileGetFacade: UserFileGetFacade,
    private readonly userFileDownloadFacade: UserFileDownloadFacade,
    private readonly userFileBulkDownloadFacade: UserFileBulkDownloadFacade,
    private readonly userFileCreateFacade: UserFileCreateFacade,
  ) {}

  @Post()
  @UsePipes(new SnakeToCamelPipe())
  async createFile(
    @Body() input: UserFileCreateDTO,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent?: string,
  ): Promise<EntityUidResponseDTO> {
    const result = await this.userFileCreateFacade.createFile(input)

    // Keep returning 200 for JupyterLab client
    if (userAgent?.includes('python-requests')) res.status(200)

    return result
  }

  @Get('/:uid/upload-url')
  async getUploadUrl(
    @Param() params: FileUidParamDTO,
    @Query() query: GetUploadUrlQueryDTO,
  ): Promise<GetUploadURLResponse> {
    const { uid } = params
    const { index, md5, size } = query
    return await this.urlFetchService.getUploadUrl(uid, index, md5, size)
  }

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
  @ApiOperation({ summary: 'Bulk download files' })
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    description: 'IDs of items to download',
    required: true,
    example: [1, 2, 3],
  })
  @ApiQuery({
    name: 'folder_id',
    type: Number,
    required: false,
    description: `
      Optional folder ID that the contents is located in.
      Should not be sent for contents in root. Non root bulk
      download has to send it - example: if you're downloading following

      /folder1/folder2/file1.txt
      /folder1/folder2/file2.txt
      /folder1/folder2/folder3/file3.txt

      you have to send ID of folder2. It's necessary for stripping paths.
    `,
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Binary stream with the downloaded content',
    content: {
      'application/octet-stream': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  async bulkDownload(
    @Query('id', new ParseArrayPipe({ items: Number })) ids: number[],
    @Res() res: Response,
    @Query('folder_id', new ParseIntPipe({ optional: true })) folderId?: number,
  ): Promise<void> {
    const filesToBeDownloaded = await this.userFileBulkDownloadFacade.composeFilesForBulkDownload(ids, folderId)

    const zip = archiver('zip', { zlib: { level: 9 } })

    res.attachment(`pfda_archive_${filesToBeDownloaded.scope}_${this.getTimestamp()}.zip`)
    zip.pipe(res)

    let archiverError: Error | undefined
    zip.on('error', err => {
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
          response.data.on('error', error => {
            reject(error)
          })
          zip.append(response.data, { name: file.path })
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        res.status(500).send(`Error creating zip: ${errorMessage}`)
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
    const pad = (number: number): number | string => (number < 10 ? '0' : '') + number
    const now = new Date()
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  }

  @UseGuards(InternalRouteGuard)
  @Get('/path-resolver')
  async resolvePath(@Query(new CustomValidationPipe({ transform: true })) query: ResolvePathDTO): Promise<ResolvePath> {
    return await this.userFileResolverFacade.resolvePath(query)
  }

  @Get('/selected')
  async getSelectedFiles(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[],
  ): Promise<SelectedNode[]> {
    return this.nodeService.listSelectedFiles(ids)
  }

  @HttpCode(200)
  @Post('/copy/validate')
  async validateCopyFiles(@Body() body: FilesValidateCopyingBodyDTO): Promise<ExistingFileSet> {
    return this.nodeService.validateCopyFiles(body.uids, body.scope)
  }

  @Get('/:uid/download')
  async getDownloadLink(
    @Param() params: FileUidParamDTO,
    @Query() options: DownloadLinkOptionsDTO,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.userFileDownloadFacade.getDownloadLink(params.uid, options)
    res.redirect(result.url)
    return
  }

  @ApiOperation({
    summary: 'Legacy endpoint for generating file download links for pre-2.12.0 CLI versions and JupyterLab',
  })
  @ApiResponse({
    status: 200,
    description: 'Download link and file size',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            file_url: { type: 'string', description: 'The URL to download the file' },
            file_size: { type: 'number', description: 'The size of the file in bytes' },
          },
        },
      },
    },
  })
  @Get('/:uid/download/legacy')
  async getLegacyDownloadLink(
    @Param() params: FileUidParamDTO,
    @Query() options: DownloadLinkOptionsDTO,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ file_url: string; file_size: number }> {
    const cliVersion = userAgent?.match(/^precisionFDA CLI\/([\d.]+)/)?.[1]
    if (cliVersion && compareVersions(cliVersion, '2.6.0') <= 0) {
      options.preauthenticated = true
    }
    const result = await this.userFileDownloadFacade.getDownloadLink(params.uid, options)
    return {
      file_url: result.url,
      file_size: result.size,
    }
  }

  @ApiOperation({ summary: 'Get file details by uid' })
  @HttpCode(200)
  @Get(':uid')
  async get(@Param('uid') uid: Uid<'file'>): Promise<FileGetDTO> {
    return await this.userFileGetFacade.getFile(uid)
  }

  @Get(':uid/:fileName')
  async downloadFile(
    @Param('uid') uid: Uid<'file'>,
    @Query('inline', new DefaultValuePipe(false), ParseBoolPipe) inline: boolean,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.userFileDownloadFacade.getDownloadLink(uid, {
      preauthenticated: true,
      inline,
      duration: TimeUtils.minutesToSeconds(5),
    })

    return res.redirect(result.url)
  }
}
