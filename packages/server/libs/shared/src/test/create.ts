import { Reference, wrap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/mysql'
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
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Expert } from '@shared/domain/expert/expert.entity'
import { Job } from '@shared/domain/job/job.entity'
import { License } from '@shared/domain/license/license.entity'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Organization } from '@shared/domain/org/org.entity'
import { Resource } from '@shared/domain/resource/resource.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Tag } from '@shared/domain/tag/tag.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { config } from '../config'
import { getScopeFromSpaceId } from '../domain/space/space.helper'
import { PARENT_TYPE } from '../domain/user-file/user-file.types'
import * as generate from './generate'

const attachmentHelper = {
  create: (
    em: EntityManager,
    references: {
      note: InstanceType<typeof Note>
    },
    data: Partial<InstanceType<typeof Attachment>>,
  ) => {
    const attachment = wrap(new Attachment(references.note)).assign(data, { em })
    em.persist(attachment)
    return attachment
  },
}
const discussionHelper = {
  create: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof User>
    },
    data?: Partial<InstanceType<typeof Discussion>>,
  ) => {
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
  createAnswer: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof User>
      discussion: InstanceType<typeof Discussion>
    },
    data?: Partial<InstanceType<typeof Answer>>,
  ) => {
    const note = wrap(new Note(references.user)).assign({
      title: generate.random.word(),
      content: generate.random.chance.paragraph(),
      scope: STATIC_SCOPE.PRIVATE,
      noteType: 'Answer',
    })
    em.persist(note)
    const answer = wrap(new Answer(note, references.discussion, references.user)).assign(
      data ?? {},
      { em },
    )
    em.persist(answer)
    return answer
  },
}

const acceptedLicenseHelper = {
  create: (
    em: EntityManager,
    references: {
      license: InstanceType<typeof License>
      user: InstanceType<typeof User>
    },
    data?: Partial<InstanceType<typeof AcceptedLicense>>,
  ) => {
    const acceptedLicense = wrap(new AcceptedLicense(references.license, references.user)).assign(
      data ?? {},
      { em },
    )
    em.persist(acceptedLicense)
    return acceptedLicense
  },
}

const alertHelper = {
  createActive: (em: EntityManager, data?: Partial<InstanceType<typeof Alert>>) => {
    const defaults = generate.alert.active()
    const input = {
      ...defaults,
      ...data,
    }
    const alert = wrap(new Alert()).assign(input, { em })
    em.persist(alert)
    return alert
  },
  createFuture: (em: EntityManager, data?: Partial<InstanceType<typeof Alert>>) => {
    const defaults = generate.alert.future()
    const input = {
      ...defaults,
      ...data,
    }
    const alert = wrap(new Alert()).assign(input, { em })
    em.persist(alert)
    return alert
  },
  createExpired: (em: EntityManager, data?: Partial<InstanceType<typeof Alert>>) => {
    const defaults = generate.alert.expired()
    const input = {
      ...defaults,
      ...data,
    }
    const alert = wrap(new Alert()).assign(input, { em })
    em.persist(alert)
    return alert
  },
}
const assetHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof Asset>>,
  ) => {
    const defaults = generate.asset.simple()
    const input = {
      ...defaults,
      ...data,
    }
    input.parentType = PARENT_TYPE.ASSET

    const asset = wrap(new Asset(references.user)).assign(input, { em })
    em.persist(asset)
    return asset
  },
}

const licenceHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof License>>,
  ) => {
    const license = wrap(new License(references.user)).assign(data ?? {}, { em })
    em.persist(license)
    return license
  },
  createForAsset: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof User>
      asset: InstanceType<typeof Asset>
    },
    data?: Partial<InstanceType<typeof License>>,
  ) => {
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
  create: (em: EntityManager) => {
    const org = wrap(new Organization()).assign({
      handle: `${generate.random.dxstr()}`,
      name: generate.random.chance.name(),
    })
    em.persist(org)
    return org
  },
}

const adminGroupHelper = {
  createReviewSpaceAdminGroup: (em: EntityManager) => {
    const RSAGroup = wrap(new AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN,
    })
    em.persist(RSAGroup)
    return RSAGroup
  },

  createSiteAdminGroup: (em: EntityManager) => {
    const group = wrap(new AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
    })
    em.persist(group)
    return group
  },

  createChallengeAdminGroup: (em: EntityManager) => {
    const group = wrap(new AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN,
    })
    em.persist(group)
    return group
  },
}

const userHelper = {
  create: (em: EntityManager, data?: Partial<InstanceType<typeof User>>) => {
    let org = orgHelper.create(em)
    em.persist(org)
    return userHelper.createUsingOrg(em, org, data)
  },

  createGov: (em: EntityManager, data?: Partial<InstanceType<typeof User>>) => {
    let org = orgHelper.create(em)
    em.persist(org)
    data = data ?? {}
    data.email = `${generate.random.dxstr()}@fda.gov`
    data.normalizedEmail = data.email.toLowerCase()
    return userHelper.createUsingOrg(em, org, data)
  },

  createUsingOrg: (
    em: EntityManager,
    org: Organization,
    data?: Partial<InstanceType<typeof User>>,
  ) => {
    const defaults = generate.user.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const user = wrap(new User(org)).assign(input, { em })
    em.persist(user)
    return user
  },

  createAdmin: (em: EntityManager) => {
    return userHelper.create(em, {
      dxuser: config.platform.adminUser,
      email: `${config.platform.adminUser}@dnanexus.com`,
    })
  },

  createRSA: (em: EntityManager) => {
    const user = userHelper.create(em)
    const adminGroup = adminGroupHelper.createReviewSpaceAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  createSiteAdmin: (em: EntityManager, group?: AdminGroup) => {
    const user = userHelper.create(em)
    const adminGroup = group ?? adminGroupHelper.createSiteAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  createChallengeAdmin: (em: EntityManager) => {
    const user = userHelper.create(em)
    const adminGroup = adminGroupHelper.createChallengeAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  createChallengeBot: (em: EntityManager) => {
    return userHelper.create(em, {
      dxuser: config.platform.challengeBotUser,
    })
  },

  addRSARole: (em: EntityManager, user: InstanceType<typeof User>) => {
    const adminGroup = adminGroupHelper.createReviewSpaceAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  addSiteAdminRole: (em: EntityManager, user: InstanceType<typeof User>) => {
    const adminGroup = adminGroupHelper.createSiteAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  addChallengeAdminRole: (em: EntityManager, user: InstanceType<typeof User>) => {
    const adminGroup = adminGroupHelper.createChallengeAdminGroup(em)
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })
    em.persist(adminMembership)
    return user
  },

  getChallengeBotToken: () => config.platform.challengeBotAccessToken,
}

const dbClusterHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof DbCluster>>,
  ) => {
    const defaults = generate.dbCluster.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const dbCluster = wrap(new DbCluster(references.user)).assign(input, { em })
    em.persist(dbCluster)
    return dbCluster
  },
}

const jobHelper = {
  create: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof User>
      app?: InstanceType<typeof App>
    },
    data?: Partial<InstanceType<typeof Job>>,
  ) => {
    const isHTTPS = references.app?.isHTTPS()
    const defaults = isHTTPS ? generate.job.simple(references.app!) : generate.job.regular()
    const input = {
      ...defaults,
      ...data,
    }
    const job = wrap(new Job(references.user, references.app)).assign(input, { em })
    em.persist(job)
    return job
  },
}

const appHelper = {
  createRegular: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof App>>,
  ) => {
    const defaults = generate.app.regular()
    const input = {
      ...defaults,
      ...data,
    }
    // const appSeriesDefaults  = generate.app.appSeries()
    // const appSeries = wrap(new AppSeries(references.user)).assign(appSeriesDefaults, { em })
    // em.persist(appSeries)
    const app = wrap(new App(references.user)).assign(input, { em })
    em.persist(app)
    return app
  },
  createHTTPS: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof App>>,
  ) => {
    const defaults = generate.app.https()
    const input = {
      ...defaults,
      ...data,
    }
    const app = wrap(new App(references.user)).assign(input, { em })
    em.persist(app)
    return app
  },
  createWithSpace: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    appData: Partial<InstanceType<typeof App>>,
    spaceData: Partial<InstanceType<typeof Space>>,
  ) => {
    const appDefaults = generate.app.regular()
    const appInput = {
      ...appDefaults,
      ...appData,
    }
    const space = wrap(new Space()).assign(spaceData, { em })
    em.persist(space)
    const app = wrap(new App(references.user)).assign(appInput, { em })
    app.scope = getScopeFromSpaceId(space.id)
    em.persist(app)
    return app
  },
}

const appSeriesHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    appSeriesData: Partial<InstanceType<typeof AppSeries>>,
  ) => {
    const appSeriesDefaults = generate.appSeries.simple()
    const appSeriesInput = {
      ...appSeriesDefaults,
      ...appSeriesData,
    }

    const appSeries = wrap(new AppSeries(references.user)).assign(appSeriesInput, { em })
    em.persist(appSeries)
    return appSeries
  },
}

const filesHelper = {
  // TODO: Rename 'create' because it is unclear that it would by default create an HTTPS file
  create: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof User>
      parentFolder?: InstanceType<typeof Folder>
      parent?: InstanceType<typeof UserFile>
    },
    data?: Partial<InstanceType<typeof UserFile>>,
  ) => {
    const defaults = generate.userFile.simple(data?.dxid)
    const input = {
      ...defaults,
      ...data,
    }
    if (references.parent) {
      input.parentId = references.parent.id
    }
    const file = wrap(new UserFile(references.user)).assign(input, { em })
    if (references.parentFolder) {
      if (
        !data?.scope ||
        [STATIC_SCOPE.PRIVATE.toString(), STATIC_SCOPE.PUBLIC.toString()].includes(data?.scope)
      ) {
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
      user: InstanceType<typeof User>
      parentFolder?: InstanceType<typeof Folder>
    },
    data?: Partial<InstanceType<typeof UserFile>>,
  ) => {
    const defaults = generate.userFile.simpleUploaded(data?.dxid)
    const input = {
      ...defaults,
      ...data,
      parentId: references.user.id,
    }
    const file = wrap(new UserFile(references.user)).assign(input, { em })
    if (references.parentFolder) {
      file.parentFolder = references.parentFolder
    }
    em.persist(file)
    return file
  },
  createUploadedAsset: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof User>
    },
    data?: Partial<InstanceType<typeof Asset>>,
  ) => {
    const defaults = generate.asset.simple(data?.dxid)
    const input = {
      ...defaults,
      ...data,
      parentId: references.user.id,
    }
    const file = wrap(new Asset(references.user)).assign(input, { em })
    em.persist(file)
    return file
  },
  createJobOutput: (
    em: EntityManager,
    params: {
      user: InstanceType<typeof User>
      jobId: number
    },
    data?: Partial<InstanceType<typeof UserFile>>,
  ) => {
    const defaults = generate.userFile.simpleJobOutput(params.jobId, data?.dxid)
    const input = {
      ...defaults,
      ...data,
    }
    const file = wrap(new UserFile(params.user)).assign(input, { em })
    em.persist(file)
    return file
  },
  createComparisonOutput: (
    em: EntityManager,
    params: {
      user: InstanceType<typeof User>
      comparisonId: number
    },
    data?: Partial<InstanceType<typeof UserFile>>,
  ) => {
    const defaults = generate.userFile.simpleComparisonOutput(params.comparisonId, data?.dxid)
    const input = {
      ...defaults,
      ...data,
    }
    const file = wrap(new UserFile(params.user)).assign(input, { em })
    em.persist(file)
    return file
  },
  createFolder: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof User>
      parentFolder?: InstanceType<typeof Folder>
    },
    data?: Partial<InstanceType<typeof Folder>>,
  ) => {
    const defaults = generate.folder.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const folder = wrap(new Folder(references.user)).assign(input)
    if (references.parentFolder) {
      if (
        !data?.scope ||
        [STATIC_SCOPE.PRIVATE.toString(), STATIC_SCOPE.PUBLIC.toString()].includes(data?.scope)
      ) {
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
      user: InstanceType<typeof User>
      parentFolder?: InstanceType<typeof Folder>
    },
    data?: Partial<InstanceType<typeof Folder>>,
  ) => {
    const defaults = generate.folder.simpleLocal()
    const input = {
      ...defaults,
      ...data,
    }
    const folder = wrap(new Folder(references.user)).assign(input)
    if (references.parentFolder) {
      folder.parentFolder = references.parentFolder
    }
    em.persist(folder)
    return folder
  },
}

const dataPortalsHelper = {
  create: (
    em: EntityManager,
    references: {
      space: InstanceType<typeof Space>
    },
    data?: Partial<InstanceType<typeof DataPortal>>,
  ) => {
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
      user: InstanceType<typeof User>
      dataPortal: InstanceType<typeof DataPortal>
    },
    name: string,
    dxid: string,
  ) => {
    const userFile = filesHelper.create(
      em,
      { user: references.user },
      {
        name: name,
        uid: `${dxid}-1`,
      },
    )
    const resource = new Resource(references.user, userFile)
    resource.dataPortal = references.dataPortal
    em.persist(resource)
    return resource
  },
}

const tagsHelper = {
  create: (em: EntityManager, data?: Partial<InstanceType<typeof Tag>>) => {
    const defaults = generate.tag.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const newTag = wrap(new Tag()).assign(input)
    em.persist(newTag)
    return newTag
  },
  createTagging: (
    em: EntityManager,
    references: { tag: InstanceType<typeof Tag> },
    data?: Partial<InstanceType<typeof Tagging>>,
  ) => {
    const defaults = generate.tagging.userfileDefaults()
    const input = {
      ...defaults,
      tag: references.tag,
      ...data,
    }
    const tagging = new Tagging()
    wrap(tagging).assign(input, { em })
    references.tag.taggings.add(tagging)
    references.tag.taggingCount++
    em.persist(tagging)
    return tagging
  },
}

const spacesHelper = {
  create: (em: EntityManager, data?: Partial<InstanceType<typeof Space>>) => {
    const defaults = generate.space.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const space = wrap(new Space()).assign(input)
    em.persist(space)
    return space
  },
  addMember: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof User>
      space: InstanceType<typeof Space>
    },
    data?: Partial<InstanceType<typeof SpaceMembership>>,
  ) => {
    const defaults = generate.spaceMembership.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const membership = wrap(new SpaceMembership(references.user, references.space, input.side, input.role)).assign(input)
    em.persist(membership)
    return membership
  },
  createEvent: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof User>
      space: InstanceType<typeof Space>
    },
    data?: Partial<InstanceType<typeof SpaceEvent>>,
  ) => {
    const defaults = generate.spaceEvent.contentAdded()
    const input = {
      ...defaults,
      ...data,
    }
    const event = wrap(new SpaceEvent(references.user, references.space)).assign(input)
    em.persist(event)
    return event
  },
}

const challengeHelper = {
  create: (
    em: EntityManager,
    references: { userAndAdmin: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof Challenge>>,
  ) => {
    const defaults = generate.challenge.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const challenge = wrap(new Challenge(references.userAndAdmin, references.userAndAdmin)).assign(
      input,
    )
    em.persist(challenge)
    return challenge
  },
}

const challengeResourceHelper = {
  create: (
    em: EntityManager,
    references: {
      user?: InstanceType<typeof User>
      challenge?: InstanceType<typeof Challenge>
      file?: InstanceType<typeof UserFile>
    },
    data?: Partial<InstanceType<typeof ChallengeResource>>,
  ) => {
    const input = {
      ...data,
    }
    const challengeResource = wrap(new ChallengeResource()).assign(input, { em })
    if (references.user) {
      challengeResource.user = Reference.create(references.user)
    }
    if (references.challenge) {
      challengeResource.challenge = Reference.create(references.challenge)
    }
    if (references.file) {
      challengeResource.userFile = Reference.create(references.file)
    }
    em.persist(challengeResource)
    return challengeResource
  },
}

const commentHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof Comment>>,
  ) => {
    const defaults = generate.comment.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const comment = wrap(new Comment(references.user)).assign(input, { em })
    em.persist(comment)
    return comment
  },
}

const noteHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof Note>>,
  ) => {
    const defaults = generate.note.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const note = wrap(new Note(references.user)).assign(input)
    em.persist(note)
    return note
  },
}
const comparisonHelper = {
  create: (
    em: EntityManager,
    references: {
      app: InstanceType<typeof App>
      user: InstanceType<typeof User>
    },
    data?: Partial<InstanceType<typeof Comparison>>,
  ) => {
    const defaults = generate.comparison.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const comparison = wrap(new Comparison(references.user, references.app)).assign(input)
    em.persist(comparison)
    return comparison
  },
  createInput: (
    em: EntityManager,
    references: {
      comparison: InstanceType<typeof Comparison>
      userFile: InstanceType<typeof UserFile>
    },
    data?: Partial<InstanceType<typeof ComparisonInput>>,
  ) => {
    const comparisonInput = wrap(
      new ComparisonInput(references.comparison, references.userFile),
    ).assign(data ?? {}, { em })
    em.persist(comparisonInput)
    return comparisonInput
  },
}

const expertHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof Comment>>,
  ): Expert => {
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

const newsHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof NewsItem>>,
  ) => {
    const defaults = generate.news.create()
    const input = {
      ...defaults,
      ...data,
    }
    const news = wrap(new NewsItem(references.user)).assign(input)
    em.persist(news)
    return news
  },
}

const workflowHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof Workflow>>,
  ) => {
    const workflow = wrap(new Workflow(references.user)).assign(data ?? { scope: 'private' }, {
      em,
    })
    em.persist(workflow)
    return workflow
  },
}

const workflowSeriesHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof User> },
    data?: Partial<InstanceType<typeof WorkflowSeries>>,
  ) => {
    const workflowSeriesDefaults = generate.workflowSeries.simple()
    const workflowSeriesInput = {
      ...workflowSeriesDefaults,
      ...data,
    }

    const workflowSeries = wrap(new WorkflowSeries(references.user)).assign(workflowSeriesInput, {
      em,
    })
    em.persist(workflowSeries)
    return workflowSeries
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
  dataPortalsHelper,
  dbClusterHelper,
  discussionHelper,
  expertHelper,
  filesHelper,
  jobHelper,
  licenceHelper,
  newsHelper,
  noteHelper,
  orgHelper,
  spacesHelper,
  tagsHelper,
  userHelper,
  workflowHelper,
  workflowSeriesHelper,
}
