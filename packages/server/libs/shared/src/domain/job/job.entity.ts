import {
  Collection,
  Entity,
  Filter,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { App } from '@shared/domain/app/app.entity'
import { JobRunData } from '@shared/domain/job/job.types'
import { JobProperty } from '@shared/domain/property/job-property.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { formatDuration } from '../../utils/format'
import { DxId } from '../entity/domain/dxid'
import { Uid } from '../entity/domain/uid'
import { JOB_DB_ENTITY_TYPE, JOB_STATE, TERMINAL_STATES } from './job.enum'
import { isStateActive, isStateTerminal } from './job.helper'
import { Provenance } from './job.input'
import { JobRepository } from './job.repository'
import { WorkaroundJsonType } from '@shared/database/json-workaround.type'
import { JobTagging } from '@shared/domain/tagging/job-tagging.entity'

@Entity({ tableName: 'jobs', repository: () => JobRepository })
@Filter({ name: 'ownedBy', cond: (args) => ({ user: { id: args.userId } }) })
// Tried the following but didn't work
// @Filter({ name: 'isActive', cond: { $or: [ ACTIVE_STATES.map(x => { return { 'state': x } }) ]}})
// @Filter({ name: 'isTerminal', cond: { $or: [ TERMINAL_STATES.map(x => { return { 'state': x } }) ]}})
@Filter({
  name: 'isActive',
  cond: { $or: [{ state: JOB_STATE.IDLE }, { state: JOB_STATE.RUNNING }] },
})
@Filter({
  name: 'isNonTerminal',
  cond: {
    $or: [
      { state: JOB_STATE.IDLE },
      { state: JOB_STATE.RUNNABLE },
      { state: JOB_STATE.RUNNING },
      { state: JOB_STATE.TERMINATING },
    ],
  },
})
@Filter({
  name: 'isTerminal',
  cond: { $or: [{ state: JOB_STATE.DONE }, { state: JOB_STATE.TERMINATED }] },
})
@Filter({
  name: 'accessibleBy',
  cond: (args) => ({
    $or: [
      { user: { id: args.userId }, scope: STATIC_SCOPE.PRIVATE },
      { scope: { $in: args.spaceScopes } },
    ],
  }),
})
export class Job extends ScopedEntity {
  @Property()
  dxid: DxId<'job'>

  @Property()
  project: DxId<'project'>

  @Property()
  state: JOB_STATE

  @Property()
  name: string

  @Property()
  entityType: number

  @Property()
  terminationEmailSent: boolean

  @OneToMany({
    entity: () => JobProperty,
    mappedBy: 'job',
    orphanRemoval: true,
  })
  properties = new Collection<JobProperty>(this)

  @OneToMany(() => JobTagging, (tagging) => tagging.job, { orphanRemoval: true })
  taggings = new Collection<JobTagging>(this)

  @Property({ type: WorkaroundJsonType })
  runData: JobRunData

  @Property({
    hidden: true,
    type: WorkaroundJsonType,
  })
  describe: JobDescribeResponse

  @Property({ type: WorkaroundJsonType })
  provenance: Provenance

  @Property({ unique: true })
  uid: Uid<'job'>

  // foreign keys -> not yet mapped
  @Property({ hidden: true })
  appSeriesId: number

  @Property({ hidden: true })
  localFolderId: number

  // relations
  @ManyToOne(() => User)
  user!: Ref<User>

  // App could be null if this job is associated with an analysis (workflow) instead
  // or if the app was deleted from the database
  @ManyToOne({ entity: () => App, nullable: true })
  app?: Ref<App>

  @ManyToMany({
    entity: () => UserFile,
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
    return (this.isHTTPS() && this.app?.getEntity().hasHttpsAppState) || false
  }

  isActive(): boolean {
    return isStateActive(this.state)
  }

  isTerminal(): boolean {
    return isStateTerminal(this.state)
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
    return this.describe?.properties?.httpsAppState === 'running'
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

  isPublishable(): boolean {
    return this.isPrivate() && TERMINAL_STATES.includes(this.state)
  }
}

export const foo = 'bar'
