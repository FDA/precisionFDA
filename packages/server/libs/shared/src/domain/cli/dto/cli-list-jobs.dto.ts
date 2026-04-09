import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Job } from '@shared/domain/job/job.entity'

export class CliListJobDTO {
  id: number
  uid: Uid<'job'>
  dxid: DxId<'job'>
  state: string
  name: string
  scope: string
  location: string
  featured: boolean
  appTitle: string | null
  appUid: Uid<'app'> | null
  appRevision: number | null
  appActive: boolean | null
  workstationApiVersion: string | null
  instanceType: string | null
  durationInSeconds: number
  energyConsumption: string
  failureReason: string
  failureMessage: string
  createdAt: Date
  launchedBy: string
  launchedByDxuser: string
  entityType: string
  tags: string[]
  properties: Record<string, string>
  runInputData: RunDataItem[]
  runOutputData: RunDataItem[]

  static fromEntity(job: Job): CliListJobDTO {
    let appTitle: string | null = null
    let appUid: Uid<'app'> | null = null
    let appRevision: number | null = null
    let appActive: boolean | null = null
    let workstationApiVersion: string | null = null

    if (job.app) {
      const app = job.app.getEntity()
      appTitle = app.title
      appUid = app.uid
      appRevision = app.revision
      appActive = !app.deleted
      workstationApiVersion = app.workstationAPIVersion
    }

    const props: Record<string, string> = {}
    job.properties.getItems().forEach(p => {
      props[p.propertyName] = p.propertyValue
    })

    const tags = job.taggings
      .getItems()
      .map(t => t.tag?.name)
      .filter(Boolean) as string[]

    const runtime = CliListJobDTO.getRuntime(job)
    const energy = CliListJobDTO.getEnergy(job)

    const runInputData = CliListJobDTO.buildRunData(job.runData?.run_inputs)
    const runOutputData = CliListJobDTO.buildRunData(job.runData?.run_outputs)
    return {
      id: job.id,
      uid: job.uid,
      dxid: job.dxid,
      state: job.state,
      name: job.name,
      scope: job.scope,
      location: job.scope,
      featured: job.featured,
      appTitle,
      appUid,
      appRevision,
      appActive,
      workstationApiVersion,
      instanceType: job.runData?.run_instance_type ?? null,
      durationInSeconds: runtime,
      energyConsumption: energy,
      failureReason: job.describe?.failureReason ?? '',
      failureMessage: job.describe?.failureMessage ?? '',
      createdAt: job.createdAt,
      launchedBy: job.user.getEntity().fullName,
      launchedByDxuser: job.user.getEntity().dxuser,
      entityType: job.getEntityTypeString(),
      tags,
      properties: props,
      runInputData,
      runOutputData,
    }
  }

  private static getRuntime(job: Job): number {
    if (!job.describe?.startedRunning || !job.describe?.stoppedRunning) {
      return 0
    }
    return Math.floor((job.describe.stoppedRunning - job.describe.startedRunning) / 1000)
  }

  private static getEnergy(job: Job): string {
    if (!job.describe?.totalPrice) {
      return 'N/A'
    }
    const totalPrice = job.describe.totalPrice
    let result = Number(totalPrice).toFixed(2)
    if (parseFloat(result) < 0.01) {
      result = Number(totalPrice).toFixed(3)
    }
    return `$${result}`
  }

  private static buildRunData(data: Record<string, unknown> | undefined): RunDataItem[] {
    if (!data) return []
    return Object.entries(data).map(([name, value]) => ({
      name,
      class: typeof value === 'string' && value.startsWith('file-') ? 'file' : typeof value,
      value: value as unknown,
    }))
  }
}

interface RunDataItem {
  name: string
  class: string
  value: unknown
}
