import { Job } from '../job.entity'
import { JOB_STATE } from '../job.enum'
import { UserFile } from '../../user-file/user-file.entity'
import { Space } from '../../space/space.entity'
import { resolveSpaceLocation } from '../../space/space.helper'
import { UserContext } from '../../user-context/model/user-context'
import type { AppInputSpecItem, AppSpecItem } from '../../app/app.input'
import type { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { StringUtils } from '@shared/utils/string.utils'
import { TimeUtils } from '@shared/utils/time.utils'
import type { JobRunData } from '../job.types'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'

interface RunDataItem {
  name: string
  class: string
  label?: string
  value?: unknown
  fileName?: string
  fileUid?: string
  state?: string
  scope?: string
  fileNames?: string[]
  fileUids?: string[]
  scopes?: string[]
}

type FileLookupKey = DxId<'file'> | Uid<'file'>

export class JobGetDTO {
  id: number
  uid: string
  dxid: string
  state: JOB_STATE
  name: string
  appTitle: string | null
  appUid: string | null
  appRevision: number | null
  appActive: boolean
  platformTags: string[] | null
  httpsAppState: JOB_STATE | null
  workstationApiVersion: string | null
  runInputData: RunDataItem[]
  runOutputData: RunDataItem[]
  runDataUpdates: JobRunData | null
  instanceType: string
  duration: string
  durationInSeconds: number
  energyConsumption: string
  failureReason: string
  failureMessage: string
  createdAt: string
  createdAtDateTime: string
  scope: string
  location: string
  launchedBy: string
  launchedByDxuser: string
  launchedOn: string
  featured: boolean
  entityType: 'regular' | 'https'
  loggedDxuser: string
  costLimit: number | null
  snapshot: boolean
  showLicensePending: boolean
  startedRunning: number | null
  stoppedRunning: number | null
  tags: string[]
  properties: Record<string, string>

  static mapToDTO(
    job: Job,
    userContext: UserContext,
    inputFiles: Map<FileLookupKey, UserFile>,
    outputFiles: Map<FileLookupKey, UserFile>,
    space?: Space,
  ): JobGetDTO {
    const dto = new JobGetDTO()
    const app = job.app?.getEntity()
    const user = job.user.getEntity()
    const describe = job.describe

    dto.id = job.id
    dto.uid = job.uid
    dto.dxid = job.dxid
    dto.state = job.state
    dto.name = job.name
    dto.appTitle = app?.title ?? null
    dto.appUid = app?.uid ?? null
    dto.appRevision = app?.revision ?? null
    dto.appActive = app ? !app.deleted : false
    dto.platformTags = app?.workstationTags ?? null
    dto.httpsAppState = describe?.properties?.httpsAppState ?? null
    dto.workstationApiVersion = app?.workstationAPIVersion ?? null

    const inputSpec: AppInputSpecItem[] = app?.spec?.input_spec ?? []
    const outputSpec: AppSpecItem[] = app?.spec?.output_spec ?? []
    dto.runInputData = buildRunInputData(inputSpec, job.runData?.run_inputs, inputFiles)
    dto.runOutputData = buildRunOutputData(outputSpec, job.runData?.run_outputs, outputFiles)
    dto.runDataUpdates = buildRunDataUpdates(job)

    dto.instanceType = job.runData?.run_instance_type ?? app?.spec?.instance_type ?? ''
    const runtimeSeconds = computeRuntime(describe)
    dto.duration = TimeUtils.humanizeSeconds(runtimeSeconds)
    dto.durationInSeconds = runtimeSeconds
    dto.energyConsumption = computeEnergy(describe)
    dto.failureReason = describe?.failureReason ?? ''
    dto.failureMessage = describe?.failureMessage ?? ''
    dto.createdAt = TimeUtils.formatShortDate(job.createdAt)
    dto.createdAtDateTime = TimeUtils.formatDateTimeUTC(job.createdAt)
    dto.scope = job.scope
    dto.location = resolveLocation(job, space)
    dto.launchedBy = user.fullName
    dto.launchedByDxuser = user.dxuser
    dto.launchedOn = TimeUtils.formatDateTimeUTC(job.createdAt)
    dto.featured = job.featured
    dto.entityType = job.isHTTPS() ? 'https' : 'regular'
    dto.loggedDxuser = userContext.dxuser
    dto.costLimit = describe?.costLimit ?? null
    dto.snapshot = app?.snapshot ?? false
    dto.showLicensePending = false

    dto.startedRunning = describe?.startedRunning ?? null
    dto.stoppedRunning = describe?.stoppedRunning ?? null

    dto.tags = job.taggings
      .getItems()
      .map(t => t.tag?.name)
      .filter(Boolean) as string[]
    dto.properties = job.properties.getItems().reduce(
      (acc, prop) => {
        acc[prop.propertyName] = prop.propertyValue
        return acc
      },
      {} as Record<string, string>,
    )

    return dto
  }
}

// Convert dynamic runData values to typed file lookup keys used by file maps.
function toFileLookupKey(value: unknown): FileLookupKey | null {
  if (typeof value !== 'string' || !value.startsWith('file-')) return null
  return value as FileLookupKey
}

function buildRunInputData(
  spec: AppInputSpecItem[],
  runInputs: Record<string, unknown> | undefined,
  files: Map<FileLookupKey, UserFile>,
): RunDataItem[] {
  if (!spec || !runInputs) return []

  const items: RunDataItem[] = []
  for (const specItem of spec) {
    const value = runInputs[specItem.name]
    if (value === undefined) continue
    items.push(buildRunDataItem(specItem, value, files, 'input'))
  }
  return items
}

function buildRunOutputData(
  spec: AppSpecItem[],
  runOutputs: Record<string, unknown> | undefined,
  files: Map<FileLookupKey, UserFile>,
): RunDataItem[] {
  if (!spec || !runOutputs) return []

  const items: RunDataItem[] = []
  for (const specItem of spec) {
    const value = runOutputs[specItem.name]
    if (value === undefined) continue
    items.push(buildRunDataItem(specItem, value, files, 'output'))
  }
  return items
}

function buildRunDataItem(
  specItem: AppSpecItem,
  value: unknown,
  files: Map<FileLookupKey, UserFile>,
  _direction: 'input' | 'output',
): RunDataItem {
  const item: RunDataItem = {
    name: specItem.name,
    class: specItem.class,
  }

  if (specItem.label) {
    item.label = specItem.label
  }

  if (specItem.class === 'file') {
    const fileId = toFileLookupKey(value)
    const file = fileId ? files.get(fileId) : undefined
    if (file) {
      item.fileName = file.name
      item.fileUid = file.uid
      item.state = file.state
      item.scope = file.scope
    } else {
      item.value = value
      item.state = 'deleted'
    }
  } else if (specItem.class === 'array:file') {
    const fileIds = Array.isArray(value) ? value : []
    const resolvedNames: string[] = []
    const resolvedUids: string[] = []
    const resolvedScopes: string[] = []

    for (const rawFileId of fileIds) {
      const fileId = toFileLookupKey(rawFileId)
      if (!fileId) continue

      const file = files.get(fileId)
      if (file) {
        resolvedNames.push(file.name)
        resolvedUids.push(file.uid)
        resolvedScopes.push(file.scope)
      }
    }

    item.fileNames = resolvedNames
    item.fileUids = resolvedUids
    item.scopes = resolvedScopes
  } else {
    item.value = value
  }

  return item
}

function buildRunDataUpdates(job: Job): JobRunData | null {
  if (!job.runData) return null

  const updates: JobRunData = { ...job.runData }

  if (updates.run_outputs) {
    const runOutputs = { ...updates.run_outputs }
    for (const key of Object.keys(runOutputs)) {
      const val = runOutputs[key]
      if (typeof val === 'string' && val.startsWith('file')) {
        runOutputs[key] = `${val}-1`
      }
    }
    updates.run_outputs = runOutputs
  }

  return updates
}

function computeRuntime(describe: JobDescribeResponse | null): number {
  const started = describe?.startedRunning
  const stopped = describe?.stoppedRunning
  if (started == null || stopped == null) return 0
  return Math.floor((stopped - started) / 1000)
}

function computeEnergy(describe: JobDescribeResponse | null): string {
  const totalPrice = describe?.totalPrice
  if (totalPrice == null) return 'N/A'

  let result = Math.round(totalPrice * 100) / 100
  if (result < 0.01) {
    result = Math.round(totalPrice * 1000) / 1000
  }
  return `$${result}`
}

function resolveLocation(job: Job, space?: Space): string {
  if (!job.isInSpace()) {
    return StringUtils.titleize(job.scope)
  }

  if (!space) return job.scope

  return resolveSpaceLocation(space)
}
