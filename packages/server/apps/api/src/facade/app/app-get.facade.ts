import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { AppGetDTO } from '@shared/domain/app/dto/app-get.dto'
import { AppService } from '@shared/domain/app/services/app.service'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobService } from '@shared/domain/job/job.service'
import { SettingService } from '@shared/domain/setting/setting.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotFoundError } from '@shared/errors'

@Injectable()
export class AppGetFacade {
  constructor(
    private readonly appService: AppService,
    private readonly jobService: JobService,
    private readonly spaceService: SpaceService,
    private readonly settingService: SettingService,
    private readonly challengeService: ChallengeService,
    private readonly userCtx: UserContext,
  ) {}

  async getApp(uidOrSeriesUid: Uid<'app'> | string): Promise<AppGetDTO> {
    const app = await this.findAccessibleApp(uidOrSeriesUid)

    if (!app) {
      throw new NotFoundError(`App ${uidOrSeriesUid} not found or not accessible`)
    }

    await this.appService.populateForDetailView(app)

    const appSeries = app.appSeries?.getEntity()
    if (!appSeries) {
      throw new NotFoundError(`App series not found for app ${uidOrSeriesUid}`)
    }

    // Load revisions: all apps in the same series accessible by current user
    const revisions = await this.appService.getAccessibleRevisions(app.appSeriesId)

    // Count accessible jobs for this app series
    const accessibleJobsCount = await this.jobService.countAccessibleByAppSeries(appSeries.id)

    // Count distinct users who have run jobs in this series (explorers)
    const explorersCount = await this.jobService.countExplorersByAppSeries(appSeries.id)

    // Determine run_by_you status
    const runByYou = await this.getRunByYouStatus(appSeries.id, appSeries.latestRevisionAppId)

    // Resolve space if app is in a space
    let space = null
    if (app.isInSpace()) {
      try {
        space = await this.spaceService.getAccessibleById(app.getSpaceId())
      } catch {
        // Space not accessible — leave null
      }
    }

    const assets = app.assets.isInitialized() ? app.assets.getItems() : []

    // Determine comparator status
    const comparator = await this.settingService.isComparatorApp(app.dxid)
    const defaultComparator = await this.settingService.isDefaultComparator(app.dxid)

    // Load assigned challenges (challenges that use this app)
    // Only visible to the app owner or site admins
    let assignedChallenges: { id: number; name: string; status: string }[] = []
    const isAppOwner = app.user?.id === this.userCtx.id
    const currentUser = await this.userCtx.loadEntity()
    const isAdmin = currentUser ? await currentUser.isSiteAdmin() : false

    if (isAppOwner || isAdmin) {
      const entities = await this.challengeService.findAssignedToApp(app.id)
      assignedChallenges = entities.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
      }))
    }

    // Load assignable challenges for this app
    const assignableEntities = await this.challengeService.findAssignableForApp(app.id)
    const assignableChallenges = assignableEntities.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
    }))

    return AppGetDTO.mapToDTO({
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
    })
  }

  private async findAccessibleApp(uidOrSeriesUid: Uid<'app'> | string): Promise<App | null> {
    if (!uidOrSeriesUid.startsWith('app-series-')) {
      const app = await this.appService.getAccessibleEntityByUid(uidOrSeriesUid as Uid<'app'>)
      if (app?.deleted) {
        return null
      }
      return app
    }

    const parts = uidOrSeriesUid.split('-')
    const appSeriesId = Number.parseInt(parts[parts.length - 1] ?? '', 10)
    if (!Number.isInteger(appSeriesId)) {
      throw new NotFoundError(`App ${uidOrSeriesUid} not found or not accessible`)
    }

    return this.appService.getLatestAccessibleBySeriesId(appSeriesId)
  }

  private async getRunByYouStatus(appSeriesId: number, latestRevisionAppId?: number): Promise<string | null> {
    const userJobAppIds = await this.jobService.findUserJobAppIds(appSeriesId)

    if (userJobAppIds.length === 0) {
      return 'Try'
    }

    if (latestRevisionAppId != null && userJobAppIds.includes(latestRevisionAppId)) {
      return 'Yes'
    }

    return 'Not this revision'
  }
}
