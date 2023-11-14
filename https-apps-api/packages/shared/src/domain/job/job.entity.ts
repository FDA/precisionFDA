import {
  Collection,
  Entity,
  Filter,
  IdentifiedReference,
  JsonType,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { JobDescribeResponse } from '@pfda/https-apps-shared/src/platform-client'
import { BaseEntity } from '../../database/base-entity'
import { WorkaroundJsonType } from '../../database/custom-json-type'
import { App } from '../app'
import { User } from '../user'
import { JobRepository } from './job.repository'
import { isStateActive, isStateTerminal } from './job.helper'
import { JOB_DB_ENTITY_TYPE, JOB_STATE } from './job.enum'
import { Provenance } from './job.input'
import { getIdFromScopeName, scopeContainsId } from '../space/space.helper'
import { formatDuration } from '../../utils/format'
import type { IOType} from '../../types/common'
import { SCOPE } from '../../types/common'
import { UserFile } from '../user-file'

export interface RunData {
  output_folder_path?: string
  run_instance_type: string
  run_inputs: {
    [key: string]: IOType
  }
  run_outputs: {
    [key: string]: IOType
  }
}

@Entity({ tableName: 'jobs', customRepository: () => JobRepository })
@Filter({ name: 'ownedBy', cond: args => ({ user: { id: args.userId } }) })
// Tried the following but didn't work
// @Filter({ name: 'isActive', cond: { $or: [ ACTIVE_STATES.map(x => { return { 'state': x } }) ]}})
// @Filter({ name: 'isTerminal', cond: { $or: [ TERMINAL_STATES.map(x => { return { 'state': x } }) ]}})
@Filter({ name: 'isActive', cond: { $or: [
  { state: JOB_STATE.IDLE },
  { state: JOB_STATE.RUNNING },
]}})
@Filter({ name: 'isNonTerminal', cond: { $or: [
  { state: JOB_STATE.IDLE },
  { state: JOB_STATE.RUNNING },
  { state: JOB_STATE.TERMINATING },
]}})
@Filter({ name: 'isTerminal', cond: { $or: [
  { state: JOB_STATE.DONE },
  { state: JOB_STATE.TERMINATED },
]}})
@Filter({
  name: 'accessibleBy', cond: args => ({
    $or: [
      {user: {id: args.userId}, scope: 'private'},
      {scope: {$in: args.spaceScopes}}]
  })
})
export class Job extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxid: string

  @Property()
  project: string

  @Property()
  state: JOB_STATE

  @Property()
  name: string

  @Property()
  scope: SCOPE

  @Property()
  entityType: number

  @Property()
  terminationEmailSent: boolean

  @Property({ type: WorkaroundJsonType })
  runData: RunData

  @Property({
    hidden: true,
    type: WorkaroundJsonType,
  })
  describe: JobDescribeResponse

  @Property({ type: JsonType, hidden: true })
  provenance: Provenance

  @Property({ hidden: true })
  uid: string

  // foreign keys -> not yet mapped
  @Property({ hidden: true })
  appSeriesId: number

  @Property({ hidden: true })
  localFolderId: number

  // @ManyToOne()
  // analysis?: IdentifiedReference<Analysis>

  // relations
  @ManyToOne(() => User)
  user!: IdentifiedReference<User>

  // App could be null if this job is associated with an analysis (workflow) instead
  // or if the app was deleted from the database
  @ManyToOne({ entity: () => App, nullable: true })
  app?: IdentifiedReference<App>

  // @ManyToOne()
  // appSeries!: IdentifiedReference<AppSeries>

  @ManyToMany({
    pivotTable: 'job_inputs',
    joinColumn: 'job_id',
    inverseJoinColumn: 'user_file_id',
  })
  inputFiles = new Collection<UserFile>(this)

  constructor(user: User, app?: App) {
    super()
    this.user = Reference.create(user)
    if (app) {
      this.app = Reference.create(app)
    }
  }

  isRegular(): boolean {
    return this.entityType === JOB_DB_ENTITY_TYPE.REGULAR
  }

  isHTTPS(): boolean {
    return this.entityType === JOB_DB_ENTITY_TYPE.HTTPS
  }

  hasHttpsAppState(): boolean {
    return this.isHTTPS() && this.app?.getEntity().hasHttpsAppState || false
  }

  isActive(): boolean {
    return isStateActive(this.state)
  }

  isTerminal(): boolean {
    return isStateTerminal(this.state)
  }

  isSpaceScope(): boolean {
    return scopeContainsId(this.scope)
  }

  getSpaceId(): number | undefined {
    try {
      return getIdFromScopeName(this.scope)
    } catch {
      return undefined
    }
  }

  getEntityTypeString(): string {
    return this.isHTTPS() ? 'HTTPS' : 'Regular'
  }

  // Calculated as the time during which the job stayed in running state
  runTime(): number {
    if (!this.describe?.startedRunning) {
      return 0
    }
    if (!this.describe?.stoppedRunning) {
      return new Date().getTime() - this.describe?.startedRunning
    }
    return this.describe.stoppedRunning - this.describe.startedRunning
  }

  runTimeString(): string {
    return formatDuration(this.runTime())
  }

  elapsedTimeSinceCreation(): number {
    return new Date().getTime() - this.createdAt.getTime()
  }

  elapsedTimeSinceCreationString(): string {
    return formatDuration(this.elapsedTimeSinceCreation())
  }

  isHttpsAppRunning(): boolean {
    return this.describe?.properties?.httpsAppState === 'running' ?? false
  }

  getHttpsAppUrl(): string | null {
    if (!this.isHTTPS()) {
      return null
    }

    const port: string = this.describe.runInput?.port || '443'
    let url = <string>this.describe.httpsApp?.dns?.url
    if (!url) {
      return null
    }

    url = url.endsWith('/') ? url.slice(0, -1) : url
    // return port === '443' ? url : `${url}:${port}`
    return `${url}:${port}`
  }
}
