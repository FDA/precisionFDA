import { EntityManager } from '@mikro-orm/core'
import { Injectable, Logger } from '@nestjs/common'
import type { AppInputSpecItem, AppSpecItem } from '@shared/domain/app/app.input'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobGetDTO } from '@shared/domain/job/dto/job-get.dto'
import { JobInput } from '@shared/domain/job/job.input'
import { JobService } from '@shared/domain/job/job.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { JobOutput } from '@shared/platform-client/platform-client.responses'
import { UidUtils } from '@shared/utils/uid.utils'

@Injectable()
export class JobGetFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: EntityManager,
    private readonly jobService: JobService,
    private readonly userFileService: UserFileService,
    private readonly userContext: UserContext,
  ) {}

  async getJob(uid: Uid<'job'>): Promise<JobGetDTO> {
    this.logger.log({ uid, userId: this.userContext.id }, 'Getting Job data.')

    const job = await this.jobService.getAccessibleEntityByUid(uid)
    if (!job) {
      this.logger.warn({ userId: this.userContext.id, jobUid: uid }, 'Job does not exist or is not accessible by user.')
      throw new NotFoundError('Job not found or not accessible')
    }

    await this.em.populate(job, ['user', 'app', 'app.appSeries', 'properties', 'taggings.tag'])

    const [inputFiles, outputFiles] = await this.resolveJobIOFiles(job)
    const space = await this.jobService.getSpaceForJob(job)

    return JobGetDTO.mapToDTO(job, this.userContext, inputFiles, outputFiles, space)
  }

  private async resolveJobIOFiles(job: {
    app?: { getEntity: () => { spec?: { input_spec?: AppInputSpecItem[]; output_spec?: AppSpecItem[] } } }
    runData?: { run_inputs?: JobInput; run_outputs?: JobOutput }
    project?: DxId<'project'>
  }): Promise<[Map<Uid<'file'> | DxId<'file'>, UserFile>, Map<Uid<'file'> | DxId<'file'>, UserFile>]> {
    const app = job.app?.getEntity()
    const inputSpec: AppInputSpecItem[] = app?.spec?.input_spec ?? []
    const outputSpec: AppSpecItem[] = app?.spec?.output_spec ?? []
    const runInputs = job.runData?.run_inputs ?? {}
    const runOutputs = job.runData?.run_outputs ?? {}

    const inputFileUids = this.collectInputFileUids(inputSpec, runInputs)
    const outputFileDxids = this.collectOutputFileDxids(outputSpec, runOutputs)

    const inputFiles = await this.userFileService.getFilesByUids(inputFileUids)
    const outputFiles =
      outputFileDxids.length > 0 && job.project
        ? await this.userFileService.getFilesByDxidsInProject(outputFileDxids, job.project)
        : []

    return [this.mapFilesByUid(inputFiles), this.mapFilesByDxid(outputFiles)]
  }

  private collectInputFileUids(inputSpec: AppInputSpecItem[], runInputs: JobInput): Uid<'file'>[] {
    const inputFileUids = new Set<Uid<'file'>>()

    for (const specItem of inputSpec) {
      const value = runInputs[specItem.name]
      if (!value) {
        continue
      }

      if (specItem.class === 'file' && UidUtils.isValidUId(value, 'file')) {
        inputFileUids.add(value)
      }

      if (specItem.class === 'array:file' && Array.isArray(value)) {
        for (const item of value) {
          if (UidUtils.isValidUId(item, 'file')) {
            inputFileUids.add(item)
          }
        }
      }
    }

    return [...inputFileUids]
  }

  private collectOutputFileDxids(outputSpec: AppSpecItem[], runOutputs: JobOutput): DxId<'file'>[] {
    const outputFileDxids = new Set<DxId<'file'>>()

    for (const specItem of outputSpec) {
      const value = runOutputs[specItem.name]
      if (!value) {
        continue
      }

      if (specItem.class === 'file' && this.isFileDxid(value)) {
        outputFileDxids.add(value)
      }

      if (specItem.class === 'array:file' && Array.isArray(value)) {
        for (const item of value) {
          if (this.isFileDxid(item)) {
            outputFileDxids.add(item)
          }
        }
      }
    }

    return [...outputFileDxids]
  }

  private mapFilesByUid(files: UserFile[]): Map<Uid<'file'> | DxId<'file'>, UserFile> {
    const filesMap = new Map<Uid<'file'> | DxId<'file'>, UserFile>()
    for (const file of files) {
      filesMap.set(file.uid, file)
    }
    return filesMap
  }

  private mapFilesByDxid(files: UserFile[]): Map<Uid<'file'> | DxId<'file'>, UserFile> {
    const filesMap = new Map<Uid<'file'> | DxId<'file'>, UserFile>()
    for (const file of files) {
      filesMap.set(file.dxid, file)
    }
    return filesMap
  }

  private isFileDxid(value: unknown): value is DxId<'file'> {
    return typeof value === 'string' && value.startsWith('file-')
  }
}
