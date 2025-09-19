import { Reference, wrap } from '@mikro-orm/core'
import { EntityManager, Loaded } from '@mikro-orm/mysql'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { ADMIN_GROUP_ROLES, AdminGroup } from '@shared/domain/admin-group/admin-group.entity'
import { AdminMembership } from '@shared/domain/admin-membership/admin-membership.entity'
import { Alert } from '@shared/domain/alert/entity/alert.entity'
import { Answer } from '@shared/domain/answer/answer.entity'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { App } from '@shared/domain/app/app.entity'
import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { ChallengeResource } from '@shared/domain/challenge/challenge-resource.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { ComparisonInput } from '@shared/domain/comparison-input/comparison-input.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { DiscussionReply } from '@shared/domain/discussion-reply/discussion-reply.entity'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { Job } from '@shared/domain/job/job.entity'
import { License } from '@shared/domain/license/license.entity'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Organization } from '@shared/domain/org/org.entity'
import { Resource } from '@shared/domain/resource/resource.entity'
import { Session } from '@shared/domain/session/session.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Tag } from '@shared/domain/tag/tag.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { SCOPE } from '@shared/types/common'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { HashUtils } from '@shared/utils/hash.utils'
import { config } from '../config'
import { PARENT_TYPE } from '../domain/user-file/user-file.types'
import * as generate from './generate'

const attachmentHelper = {
  create: (
    em: EntityManager,
    references: {
      note: Note
    },
    data: Partial<Attachment>,
  ): Attachment => {
    const attachment = wrap(new Attachment(data.itemId, data.itemType, references.note)).assign(
      data,
      { em },
    )
    em.persist(attachment)
    return attachment
  },
}

const acceptedLicenseHelper = {
  create: (
    em: EntityManager,
    references: {
      license: License
      user: User
    },
    data?: Partial<AcceptedLicense>,
  ): AcceptedLicense => {
    const acceptedLicense = wrap(new AcceptedLicense(references.license, references.user)).assign(
      data ?? {},
      { em },
    )
    em.persist(acceptedLicense)
    return acceptedLicense
  },
}

type AlertData = Partial<Alert>
const createAlert = (em: EntityManager, generator: () => AlertData, data?: AlertData): Alert => {
  const alert = wrap(new Alert()).assign({ ...generator(), ...data }, { em })
  em.persist(alert)
  return alert
}

const alertHelper = {
  createActive: (em: EntityManager, data?: AlertData): Alert =>
    createAlert(em, generate.alert.active, data),

  createFuture: (em: EntityManager, data?: AlertData): Alert =>
    createAlert(em, generate.alert.future, data),

  createExpired: (em: EntityManager, data?: AlertData): Alert =>
    createAlert(em, generate.alert.expired, data),
}
const assetHelper = {
  create: (em: EntityManager, references: { user: User }, data?: Partial<Asset>): Asset => {
    const asset = wrap(new Asset(references.user)).assign(
      {
        ...generate.asset.simple(),
        ...data,
        parentType: PARENT_TYPE.ASSET,
      },
      { em },
    )

    em.persist(asset)
    return asset
  },
}

const licenceHelper = {
  create: (em: EntityManager, references: { user: User }, data?: Partial<License>): License => {
    const license = wrap(new License(references.user)).assign(data ?? {}, { em })
    em.persist(license)
    return license
  },

  createForAsset: (
    em: EntityManager,
    references: {
      user: User
      asset: Asset
    },
    data?: Partial<License>,
  ): License => {
    const license = wrap(new License(references.user)).assign(data ?? {}, { em })
    em.persist(license)

    const licensedItem = wrap(new LicensedItem(license, references.asset.id)).assign(
      { licenseableType: 'Node' },
      { em },
    )
    em.persist(licensedItem)

    return license
  },
}

const orgHelper = {
  create: (em: EntityManager): Organization => {
    const org = wrap(new Organization()).assign({
      handle: `${generate.random.dxstr()}`,
      name: generate.random.chance.name(),
    })

    em.persist(org)
    return org
  },
}

const adminGroupHelper = {
  createReviewSpaceAdminGroup: (em: EntityManager): AdminGroup => {
    const rsaGroup = wrap(new AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN,
    })

    em.persist(rsaGroup)
    return rsaGroup
  },

  createSiteAdminGroup: (em: EntityManager): AdminGroup => {
    const group = wrap(new AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
    })

    em.persist(group)
    return group
  },

  createChallengeAdminGroup: (em: EntityManager): AdminGroup => {
    const group = wrap(new AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN,
    })

    em.persist(group)
    return group
  },
}

const userHelper = {
  create: (em: EntityManager, data?: Partial<User>): User => {
    const org = orgHelper.create(em)
    em.persist(org)
    return userHelper.createUsingOrg(em, org, data)
  },

  createGov: (em: EntityManager, data?: Partial<User>): User => {
    const org = orgHelper.create(em)
    em.persist(org)

    const email = `${generate.random.dxstr()}@fda.gov`
    const govData = {
      ...data,
      email,
      normalizedEmail: email.toLowerCase(),
    }

    return userHelper.createUsingOrg(em, org, govData)
  },

  createUsingOrg: (em: EntityManager, org: Organization, data?: Partial<User>): User => {
    const user = wrap(new User(org)).assign(
      {
        ...generate.user.simple(),
        ...data,
      },
      { em },
    )

    em.persist(user)
    return user
  },

  createAdmin: (em: EntityManager): User => {
    return userHelper.create(em, {
      dxuser: config.platform.adminUser,
      email: `${config.platform.adminUser}@dnanexus.com`,
    })
  },

  createRSA: (em: EntityManager): User => {
    const user = userHelper.create(em)
    const adminGroup = adminGroupHelper.createReviewSpaceAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  createSiteAdmin: (em: EntityManager, group?: AdminGroup): User => {
    const user = userHelper.create(em)
    const adminGroup = group ?? adminGroupHelper.createSiteAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  createChallengeAdmin: (em: EntityManager): User => {
    const user = userHelper.create(em)
    const adminGroup = adminGroupHelper.createChallengeAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  createChallengeBot: (em: EntityManager): User => {
    return userHelper.create(em, {
      dxuser: config.platform.challengeBotUser,
    })
  },

  addRSARole: (em: EntityManager, user: User): User => {
    const adminGroup = adminGroupHelper.createReviewSpaceAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  addSiteAdminRole: (em: EntityManager, user: User): User => {
    const adminGroup = adminGroupHelper.createSiteAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  addChallengeAdminRole: (em: EntityManager, user: User): User => {
    const adminGroup = adminGroupHelper.createChallengeAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  getChallengeBotToken: (): string => config.platform.challengeBotAccessToken,
}

const discussionHelper = {
  create: (
    em: EntityManager,
    references: { user: User },
    data?: Partial<Discussion>,
  ): Discussion => {
    const note = wrap(new Note(references.user)).assign({
      title: generate.random.word(),
      content: generate.random.chance.paragraph(),
      scope: STATIC_SCOPE.PRIVATE,
      noteType: 'Discussion',
    })
    em.persist(note)

    const discussion = wrap(new Discussion(note, references.user)).assign(data ?? {}, { em })
    em.persist(discussion)
    return discussion
  },

  createInSpace: (
    em: EntityManager,
    references: {
      user: User
      space: Space
    },
    data?: Partial<Discussion>,
  ): Discussion => {
    const note = wrap(new Note(references.user)).assign({
      title: generate.random.word(),
      content: generate.random.chance.paragraph(),
      scope: references.space.scope,
      noteType: 'Discussion',
    })
    em.persist(note)

    const discussion = wrap(new Discussion(note, references.user)).assign(data ?? {}, { em })
    em.persist(discussion)
    return discussion
  },

  createPublic: (
    em: EntityManager,
    references: { user: User },
    data?: Partial<Discussion>,
  ): Discussion => {
    const note = wrap(new Note(references.user)).assign({
      title: generate.random.word(),
      content: generate.random.chance.paragraph(),
      scope: STATIC_SCOPE.PUBLIC,
      noteType: 'Discussion',
    })
    em.persist(note)

    const discussion = wrap(new Discussion(note, references.user)).assign(data ?? {}, { em })
    em.persist(discussion)
    return discussion
  },

  createAnswer: (
    em: EntityManager,
    references: {
      user: User
      discussion: Discussion
      scope?: SCOPE
      parent?: DiscussionReply
    },
    data?: Partial<DiscussionReply>,
  ): DiscussionReply => {
    const note = wrap(new Note(references.user)).assign({
      title: generate.random.word(),
      content: generate.random.chance.paragraph(),
      scope: references.scope ?? STATIC_SCOPE.PRIVATE,
      noteType: DISCUSSION_REPLY_TYPE.ANSWER,
    })
    em.persist(note)

    const answer = wrap(new Answer(note, references.discussion, references.user)).assign(
      data ?? {},
      { em },
    )
    em.persist(answer)
    return answer
  },

  createReply: (
    em: EntityManager,
    type: DISCUSSION_REPLY_TYPE,
    references: {
      user: User
      discussion: Discussion
      scope?: SCOPE
      parent?: DiscussionReply
    },
    data?: Partial<DiscussionReply>,
  ): DiscussionReply => {
    const note = wrap(new Note(references.user)).assign({
      title: generate.random.word(),
      content: generate.random.chance.paragraph(),
      scope: references.scope ?? STATIC_SCOPE.PRIVATE,
      noteType: type,
    })
    em.persist(note)

    const reply = wrap(
      new DiscussionReply(note, references.discussion, references.user, references.parent),
    ).assign(data ?? {}, { em })
    reply.replyType = type
    em.persist(reply)
    return reply
  },
}

const dbClusterHelper = {
  create: (em: EntityManager, references: { user: User }, data?: Partial<DbCluster>): DbCluster => {
    const dbCluster = wrap(new DbCluster(references.user)).assign(
      {
        ...generate.dbCluster.simple(),
        ...data,
      },
      { em },
    )

    em.persist(dbCluster)
    return dbCluster
  },
}

const jobHelper = {
  create: (
    em: EntityManager,
    references: {
      user: User
      app?: App
    },
    data?: Partial<Job>,
  ): Job => {
    const isHTTPS = references.app?.isHTTPS()
    const defaults = isHTTPS ? generate.job.simple(references.app!) : generate.job.regular()

    const job = wrap(new Job(references.user, references.app)).assign(
      {
        ...defaults,
        ...data,
      },
      { em },
    )

    em.persist(job)
    return job
  },
}

const appHelper = {
  createRegular: (em: EntityManager, references: { user: User }, data?: Partial<App>): App => {
    const app = wrap(new App(references.user)).assign(
      {
        ...generate.app.regular(),
        ...data,
      },
      { em },
    )

    em.persist(app)
    return app
  },

  createHTTPS: (em: EntityManager, references: { user: User }, data?: Partial<App>): App => {
    const app = wrap(new App(references.user)).assign(
      {
        ...generate.app.https(),
        ...data,
      },
      { em },
    )

    em.persist(app)
    return app
  },

  createWithSpace: (
    em: EntityManager,
    references: { user: User },
    appData: Partial<App>,
    spaceData: Partial<Space>,
  ): App => {
    const space = wrap(new Space()).assign(spaceData, { em })
    em.persist(space)

    const app = wrap(new App(references.user)).assign(
      {
        ...generate.app.regular(),
        ...appData,
      },
      { em },
    )
    app.scope = EntityScopeUtils.getScopeFromSpaceId(space.id)

    em.persist(app)
    return app
  },
}

const appSeriesHelper = {
  create: (
    em: EntityManager,
    references: { user: User },
    appSeriesData: Partial<AppSeries>,
  ): AppSeries => {
    const appSeries = wrap(new AppSeries(references.user)).assign(
      {
        ...generate.appSeries.simple(),
        ...appSeriesData,
      },
      { em },
    )

    em.persist(appSeries)
    return appSeries
  },
}

const filesHelper = {
  // TODO: Rename 'create' because it is unclear that it would by default create an HTTPS file
  create: (
    em: EntityManager,
    references: {
      user: User
      parentFolder?: Folder
      parent?: UserFile
    },
    data?: Partial<UserFile>,
  ): UserFile => {
    const input = {
      ...generate.userFile.simple(data?.dxid),
      ...data,
    }

    if (references.parent) {
      input.parentId = references.parent.id
    }

    const file = wrap(new UserFile(references.user)).assign(input, { em })

    if (references.parentFolder) {
      if (!EntityScopeUtils.isSpaceScope(file.scope)) {
        file.parentFolder = references.parentFolder
      } else {
        file.scopedParentFolder = references.parentFolder
      }
    }

    em.persist(file)
    return file
  },

  createUploaded: (
    em: EntityManager,
    references: {
      user: User
      parentFolder?: Folder
    },
    data?: Partial<UserFile>,
  ): UserFile => {
    const file = wrap(new UserFile(references.user)).assign(
      {
        ...generate.userFile.simpleUploaded(data?.dxid),
        ...data,
        parentId: references.user.id,
      },
      { em },
    )

    if (references.parentFolder) {
      file.parentFolder = references.parentFolder
    }

    em.persist(file)
    return file
  },

  createAsset: (em: EntityManager, references: { user: User }, data?: Partial<Asset>): Asset => {
    const asset = wrap(new Asset(references.user)).assign(
      {
        ...generate.asset.simple(data?.dxid),
        ...data,
        parentId: references.user.id,
      },
      { em },
    )

    em.persist(asset)
    return asset
  },

  createJobOutput: (
    em: EntityManager,
    params: {
      user: User
      jobId: number
    },
    data?: Partial<UserFile>,
  ): UserFile => {
    const file = wrap(new UserFile(params.user)).assign(
      {
        ...generate.userFile.simpleJobOutput(params.jobId, data?.dxid),
        ...data,
      },
      { em },
    )

    em.persist(file)
    return file
  },

  createComparisonOutput: (
    em: EntityManager,
    params: {
      user: User
      comparisonId: number
    },
    data?: Partial<UserFile>,
  ): UserFile => {
    const file = wrap(new UserFile(params.user)).assign(
      {
        ...generate.userFile.simpleComparisonOutput(params.comparisonId, data?.dxid),
        ...data,
      },
      { em },
    )

    em.persist(file)
    return file
  },

  createFolder: (
    em: EntityManager,
    references: {
      user: User
      parentFolder?: Folder
    },
    data?: Partial<Folder>,
  ): Folder => {
    const folder = wrap(new Folder(references.user)).assign({
      ...generate.folder.simple(),
      ...data,
    })

    if (references.parentFolder) {
      if (!EntityScopeUtils.isSpaceScope(folder.scope)) {
        folder.parentFolder = references.parentFolder
      } else {
        folder.scopedParentFolder = references.parentFolder
      }
    }

    em.persist(folder)
    return folder
  },

  createLocalOnlyFolder: (
    em: EntityManager,
    references: {
      user: User
      parentFolder?: Folder
    },
    data?: Partial<Folder>,
  ): Folder => {
    const folder = wrap(new Folder(references.user)).assign({
      ...generate.folder.simpleLocal(),
      ...data,
    })

    if (references.parentFolder) {
      folder.parentFolder = references.parentFolder
    }

    em.persist(folder)
    return folder
  },
}

const workflowHelper = {
  create: (em: EntityManager, references: { user: User }, data?: Partial<Workflow>): Workflow => {
    const workflow = wrap(new Workflow(references.user)).assign(
      {
        ...generate.workflow.simple(),
        ...data,
      },
      { em },
    )

    em.persist(workflow)
    return workflow
  },
}

const workflowSeriesHelper = {
  create: (
    em: EntityManager,
    references: { user: User },
    data?: Partial<WorkflowSeries>,
  ): WorkflowSeries => {
    const workflowSeries = wrap(new WorkflowSeries(references.user)).assign(
      {
        ...generate.workflowSeries.simple(),
        ...data,
      },
      { em },
    )

    em.persist(workflowSeries)
    return workflowSeries
  },
}

const newsHelper = {
  create: (em: EntityManager, references: { user: User }, data?: Partial<NewsItem>): NewsItem => {
    const news = wrap(new NewsItem(references.user)).assign({
      ...generate.news.create(),
      ...data,
    })

    em.persist(news)
    return news
  },
}

const sessionHelper = {
  create: (em: EntityManager, references: { user: User }): Session => {
    const session = new Session(references.user)
    session.key = HashUtils.hashSessionId(`session-id-${references.user.dxuser}`)
    em.persist(session)
    return session
  },
}

const dataPortalsHelper = {
  create: (
    em: EntityManager,
    references: { space: Space },
    data?: Partial<DataPortal>,
  ): DataPortal => {
    const dataPortal = wrap(new DataPortal(references.space)).assign(
      data ?? { urlSlug: `default-${references.space.id}` },
      { em },
    )

    em.persist(dataPortal)
    return dataPortal
  },

  addResource: (
    em: EntityManager,
    references: {
      user: User
      dataPortal: DataPortal
    },
    name: string,
    dxid: string,
  ): Resource => {
    const userFile = filesHelper.create(
      em,
      { user: references.user },
      {
        name,
        uid: `file-${dxid}-1`,
      },
    )

    const resource = new Resource(references.user, userFile)
    resource.dataPortal = references.dataPortal
    em.persist(resource)
    return resource
  },
}

const tagsHelper = {
  create: (em: EntityManager, data?: Partial<Tag>): Tag => {
    const newTag = wrap(new Tag()).assign({
      ...generate.tag.simple(),
      ...data,
    })

    em.persist(newTag)
    return newTag
  },

  createTagging: (
    em: EntityManager,
    references: { tag: Tag },
    data?: Partial<Tagging>,
  ): Tagging => {
    const tagging = new Tagging()
    wrap(tagging).assign(
      {
        ...generate.tagging.userfileDefaults(),
        tag: references.tag,
        ...data,
      },
      { em },
    )

    references.tag.taggings.add(tagging)
    references.tag.taggingCount++
    em.persist(tagging)
    return tagging
  },
}

const spacesHelper = {
  create: (em: EntityManager, data?: Partial<Space>): Space => {
    const space = wrap(new Space()).assign({
      ...generate.space.simple(),
      ...data,
    })
    em.persist(space)
    return space
  },

  addMember: (
    em: EntityManager,
    references: { user: User; space: Space },
    data?: Partial<SpaceMembership>,
  ): SpaceMembership => {
    const defaults = generate.spaceMembership.simple()
    const membership = wrap(
      new SpaceMembership(references.user, references.space, defaults.side, defaults.role),
    ).assign({
      ...defaults,
      ...data,
    })
    em.persist(membership)
    return membership
  },

  createEvent: (
    em: EntityManager,
    references: { user: User; space: Space },
    data?: Partial<SpaceEvent>,
  ): SpaceEvent => {
    const event = wrap(new SpaceEvent(references.user, references.space)).assign({
      ...generate.spaceEvent.contentAdded(),
      ...data,
    })
    em.persist(event)
    return event
  },
}

const challengeHelper = {
  create: (em: EntityManager, data?: Partial<Challenge>): Challenge => {
    const challenge = wrap(new Challenge()).assign({
      ...generate.challenge.simple(),
      ...data,
    })

    em.persist(challenge)
    return challenge
  },
}

const challengeResourceHelper = {
  create: (
    em: EntityManager,
    references: {
      user: User
      challenge: Challenge
      file: UserFile
    },
    data?: Partial<ChallengeResource>,
  ): ChallengeResource => {
    const challengeResource = wrap(
      new ChallengeResource(references.user.id, references.challenge.id, references.file.id),
    ).assign(data ?? {}, { em })

    em.persist(challengeResource)
    return challengeResource
  },
}

const commentHelper = {
  create: (em: EntityManager, references: { user: User }, data?: Partial<Comment>): Comment => {
    const comment = wrap(new Comment(references.user)).assign(
      {
        ...generate.comment.simple(),
        ...data,
      },
      { em },
    )

    em.persist(comment)
    return comment
  },
}

const noteHelper = {
  create: (em: EntityManager, references: { user: User }, data?: Partial<Note>): Note => {
    const note = wrap(new Note(references.user)).assign({
      ...generate.note.simple(),
      ...data,
    })

    em.persist(note)
    return note
  },
}

const comparisonHelper = {
  create: (
    em: EntityManager,
    references: {
      app: App
      user: User
    },
    data?: Partial<Comparison>,
  ): Comparison => {
    const comparison = wrap(new Comparison(references.user, references.app)).assign({
      ...generate.comparison.simple(),
      ...data,
    })

    em.persist(comparison)
    return comparison
  },

  createInput: (
    em: EntityManager,
    references: {
      comparison: Comparison
      userFile: UserFile
    },
    data?: Partial<ComparisonInput>,
  ): ComparisonInput => {
    const comparisonInput = wrap(
      new ComparisonInput(references.comparison, references.userFile),
    ).assign(data ?? {}, { em })

    em.persist(comparisonInput)
    return comparisonInput
  },
}

const invitationHelper = {
  create: (em: EntityManager, data?: Partial<Invitation>): Invitation => {
    const invitation = wrap(new Invitation()).assign(
      {
        ...generate.invitation.simple(),
        ...data,
      },
      { em },
    )

    em.persist(invitation)
    return invitation
  },
}

const expertHelper = {
  create: (em: EntityManager, references: { user: User }, data?: Partial<Expert>): Expert => {
    const defaults = generate.expert.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const expert = wrap(new Expert(references.user)).assign(input)
    em.persist(expert)
    return expert
  },
}

const expertQuestionHelper = {
  create: (
    em: EntityManager,
    references: {
      expert: InstanceType<typeof Expert>
      user: InstanceType<typeof User>
    },
    data?: Partial<InstanceType<typeof ExpertQuestion>>,
  ): ExpertQuestion => {
    const defaults = generate.expertQuestion.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const expertQuestion = wrap(new ExpertQuestion()).assign(input)
    expertQuestion.user = Reference.create(references.user)
    expertQuestion.expert = Reference.create(references.expert)
    em.persist(expertQuestion)
    return expertQuestion
  },
}

const contextHelper = {
  create: (user: User): UserContext => {
    return {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: generate.random.chance.hash(),
      sessionId: '1',
      async loadEntity(): Promise<Loaded<User, never, '*', never> | null> {
        return user
      },
    }
  },
}

export {
  acceptedLicenseHelper,
  alertHelper,
  appHelper,
  appSeriesHelper,
  assetHelper,
  attachmentHelper,
  challengeHelper,
  challengeResourceHelper,
  commentHelper,
  comparisonHelper,
  contextHelper,
  dataPortalsHelper,
  dbClusterHelper,
  discussionHelper,
  expertHelper,
  expertQuestionHelper,
  filesHelper,
  invitationHelper,
  jobHelper,
  licenceHelper,
  newsHelper,
  noteHelper,
  orgHelper,
  sessionHelper,
  spacesHelper,
  tagsHelper,
  userHelper,
  workflowHelper,
  workflowSeriesHelper,
}
