import {
  Collection,
  Entity,
  Filter,
  IdentifiedReference,
  JsonType,
  ManyToMany,
  ManyToOne,
  OnLoad,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { WorkaroundJsonType } from '../../database/custom-json-type'
import { IOType, SCOPE } from '../../types/common'
import { formatDuration } from '../../utils/format'
import { App } from '../app'
import { getIdFromScopeName, scopeContainsId } from '../space/space.helper'
import { User } from '../user'
import { UserFile } from '../user-file'
import { JOB_DB_ENTITY_TYPE, JOB_STATE } from './job.enum'
import { isStateActive, isStateTerminal } from './job.helper'
import { Provenance } from './job.input'
import { JobRepository } from './job.repository'

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
  { 'state': JOB_STATE.IDLE },
  { 'state': JOB_STATE.RUNNING },
]}})
@Filter({ name: 'isNonTerminal', cond: { $or: [
  { 'state': JOB_STATE.IDLE },
  { 'state': JOB_STATE.RUNNING },
  { 'state': JOB_STATE.TERMINATING },
]}})
@Filter({ name: 'isTerminal', cond: { $or: [
  { 'state': JOB_STATE.DONE },
  { 'state': JOB_STATE.TERMINATED },
]}})
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
    onCreate: (entity: Job) => entity.parseJobDescribe(),
    onUpdate: (entity: Job) => entity.parseJobDescribe(),
  })
  describe: string

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
    if (!this.startedRunning) {
      return 0
    }
    if (!this.stoppedRunning) {
      return new Date().getTime() - this.startedRunning
    }
    return this.stoppedRunning - this.startedRunning
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

  parseJobDescribe() {
    if (!this.describe) {
      return this.describe
    }
    try {
      const parsedJSON = JSON.parse(this.describe)
      this.startedRunning = parsedJSON.startedRunning
      this.stoppedRunning = parsedJSON.stoppedRunning
      this.failureReason = parsedJSON.failureReason
      this.failureMessage = parsedJSON.failureMessage
    }
    catch {
      console.log(`Error parsing job describe: ${this.describe}`)
    }
    // onCreate / onUpdate needs a return value
    return this.describe
  }

  // TODO(samuel) standardize or refactor this
  // TODO(samuel) investigate mikro-orm docs if this is the optimal way to load entities
  @OnLoad()
  initDescribeFields() { this.parseJobDescribe() }

  // Properties extracted from job describe
  //
  @Property({ persist: false })
  startedRunning: number

  @Property({ persist: false })
  stoppedRunning: number

  @Property({ persist: false, serializedName: 'failure_reason' })
  failureReason: string

  @Property({ persist: false, serializedName: 'failure_message' })
  failureMessage: string

  getHttpsAppUrl(): string | null {
    if (!this.isHTTPS()) {
      return null
    }

    const parsedDescribe = JSON.parse(this.describe)
    const port: string = parsedDescribe.runInput?.port || '443'
    let url: string = parsedDescribe.httpsApp?.dns?.url
    if (!url) {
      return null
    }

    url = url.endsWith('/') ? url.slice(0, -1) : url
    // return port === '443' ? url : `${url}:${port}`
    return `${url}:${port}`
  }
}
