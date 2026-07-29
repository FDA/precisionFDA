import { App, AppSpec, Internal } from '@shared/domain/app/app.entity'
import { AppInputSpecItem, AppSpecItem } from '@shared/domain/app/app.input'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { TimeUtils } from '@shared/utils/time.utils'
import { ENTITY_TYPE } from '../app.enum'

interface AppRevisionDTO {
  id: number
  uid: string
  title: string
  revision: number
  version: string
  deleted: boolean
}

interface AppBodyDTO {
  id: number
  uid: string
  dxid: string
  entityType: string
  name: string
  title: string
  addedBy: string
  addedByFullname: string
  addedByUserId: number
  createdAt: string
  createdAtDateTime: string
  updatedAt: string
  location: string
  readme: string
  scope: string
  forkedFrom: string | null
  revision: number
  latestRevision: boolean
  appSeriesId: number
  runByYou: string | null
  org: string | null
  explorers: number
  featured: boolean
  active: boolean
  tags: string[]
  properties: Record<string, string>
}

interface AssetDTO {
  id: number
  uid: string
  name: string
}

// Only the fields the client actually needs from the persisted JSON blob.
// Avoid passing through the whole `app.spec` JSON, which can contain extra
// platform fields (network access, allowed projects, system requirements, …)
// that must not leak in the API response.
interface AppSpecDTO {
  inputSpec: AppInputSpecDTO[]
  outputSpec: AppOutputSpecDTO[]
  internetAccess: boolean
  instanceType: string
}

// Whitelist of input/output spec fields. Avoid passing through `suggestions`
// from the persisted spec because that field can contain references to files
// the current user does not have access to.
type AppInputSpecDTO = Pick<AppInputSpecItem, 'name' | 'class' | 'label' | 'help' | 'optional' | 'default' | 'choices'>
type AppOutputSpecDTO = Pick<AppSpecItem, 'name' | 'class' | 'label' | 'help' | 'optional' | 'default'>

// Same reasoning as `AppSpecDTO`: do not leak whatever else is stored in
// `app.internal` (e.g. platform tags, ordered assets used only by the worker).
interface AppInternalDTO {
  code: string
  packages: string[]
}

interface AppMetaDTO {
  spec: AppSpecDTO
  internal: AppInternalDTO
  release: string
  assets: AssetDTO[]
  revisions: AppRevisionDTO[]
  accessibleJobsCount: number
  comparator: boolean
  defaultComparator: boolean
  assignedChallenges: ChallengeDTO[]
  challenges: ChallengeDTO[]
}

interface ChallengeDTO {
  id: number
  name: string
  status: string
}

interface AppGetDTOMapOptions {
  app: App
  appSeries: AppSeries
  revisions: Pick<App, 'id' | 'uid' | 'title' | 'revision' | 'version' | 'deleted'>[]
  accessibleJobsCount: number
  explorersCount: number
  runByYou: string | null
  assets: Asset[]
  space: Space | null
  comparator: boolean
  defaultComparator: boolean
  assignedChallenges: ChallengeDTO[]
  assignableChallenges: ChallengeDTO[]
}

export class AppGetDTO {
  app: AppBodyDTO
  meta: AppMetaDTO

  static mapToDTO({
    app,
    appSeries,
    revisions,
    accessibleJobsCount,
    explorersCount,
    runByYou,
    assets,
    space,
    comparator,
    defaultComparator,
    assignedChallenges,
    assignableChallenges,
  }: AppGetDTOMapOptions): AppGetDTO {
    const dto = new AppGetDTO()
    const user = app.user.getEntity()

    dto.app = {
      id: app.id,
      uid: app.uid,
      dxid: app.dxid,
      entityType: app.entityType === ENTITY_TYPE.HTTPS ? 'https' : 'regular',
      name: appSeries.name ?? '',
      title: app.title,
      addedBy: user.dxuser,
      addedByFullname: user.fullName,
      addedByUserId: user.id,
      createdAt: TimeUtils.formatShortDate(app.createdAt),
      createdAtDateTime: TimeUtils.formatDateTimeUTC(app.createdAt),
      updatedAt: TimeUtils.formatAtTime(app.updatedAt),
      location: computeLocation(app, space),
      readme: app.readme,
      scope: app.scope,
      forkedFrom: app.forkedFrom,
      revision: app.revision,
      latestRevision: app.id === appSeries.latestRevisionAppId,
      appSeriesId: app.appSeriesId,
      runByYou,
      org: user.organization?.isInitialized() ? user.organization.getEntity().handle : null,
      explorers: explorersCount,
      featured: app.featured,
      active: !app.deleted,
      tags: buildTags(appSeries),
      properties: buildProperties(appSeries),
    }

    dto.meta = {
      spec: mapSpec(app.spec),
      internal: mapInternal(app.internal),
      release: app.release,
      assets: assets.map(a => ({ id: a.id, uid: a.uid, name: a.name })),
      revisions: revisions.map(mapRevision),
      accessibleJobsCount,
      comparator,
      defaultComparator,
      assignedChallenges,
      challenges: assignableChallenges,
    }

    return dto
  }
}

function buildTags(appSeries: AppSeries): string[] {
  if (!appSeries.taggings.isInitialized()) return []
  return appSeries.taggings
    .getItems()
    .map(t => t.tag?.name ?? '')
    .filter(Boolean)
}

function buildProperties(appSeries: AppSeries): Record<string, string> {
  const props: Record<string, string> = {}
  if (!appSeries.properties.isInitialized()) return props
  for (const prop of appSeries.properties.getItems()) {
    props[prop.propertyName] = prop.propertyValue
  }
  return props
}

function computeLocation(app: App, space: Space | null): string {
  if (!app.isInSpace()) {
    return app.scope === 'public' ? 'Public' : 'Private'
  }
  if (space) {
    const suffix = space.isConfidential() ? 'Private' : 'Shared'
    return `${space.name} - ${suffix}`
  }
  return 'Space'
}

function mapInputSpec(item: AppInputSpecItem): AppInputSpecDTO {
  return {
    name: item.name,
    class: item.class,
    label: item.label,
    help: item.help,
    optional: item.optional,
    default: item.default,
    choices: item.choices,
  }
}

function mapOutputSpec(item: AppSpecItem): AppOutputSpecDTO {
  return {
    name: item.name,
    class: item.class,
    label: item.label,
    help: item.help,
    optional: item.optional,
    default: item.default,
  }
}

function mapSpec(spec: AppSpec | null | undefined): AppSpecDTO {
  return {
    inputSpec: (spec?.input_spec ?? []).map(mapInputSpec),
    outputSpec: (spec?.output_spec ?? []).map(mapOutputSpec),
    internetAccess: spec?.internet_access ?? false,
    instanceType: spec?.instance_type ?? '',
  }
}

function mapInternal(internal: Internal | null | undefined): AppInternalDTO {
  return {
    code: internal?.code ?? '',
    packages: internal?.packages ?? [],
  }
}

function mapRevision(rev: Pick<App, 'id' | 'uid' | 'title' | 'revision' | 'version' | 'deleted'>): AppRevisionDTO {
  return {
    id: rev.id,
    uid: rev.uid,
    title: rev.title,
    revision: rev.revision,
    version: rev.version,
    deleted: rev.deleted,
  }
}
