import { EntityManager } from '@mikro-orm/mysql'
import { Reference, wrap } from '@mikro-orm/core'
import { config } from '../config'
import { AppSeries, entities, Expert, User, user } from '../domain'
import * as generate from './generate'
import { getScopeFromSpaceId } from '../domain/space/space.helper'
import { PARENT_TYPE } from '../domain/user-file/user-file.types'
import { ADMIN_GROUP_ROLES } from '../domain/admin-group'
import { random } from './generate'

const acceptedLicenseHelper = {
  create: (
    em: EntityManager,
    references: {
      license: InstanceType<typeof entities.License>
      user: InstanceType<typeof entities.User>
    },
    data?: Partial<InstanceType<typeof entities.AcceptedLicense>>,
  ) => {
    const acceptedLicense
      = wrap(new entities.AcceptedLicense(references.license, references.user)).assign(data, { em })
    em.persist(acceptedLicense)
    return acceptedLicense
  },
}

const assetHelper = {
  create: (
    em: EntityManager,
    references: {user: InstanceType<typeof entities.User>},
    data?: Partial<InstanceType<typeof entities.Asset>>,
  ) => {
    const defaults = generate.asset.simple()
    const input = {
      ...defaults,
      ...data,
    }
    input.parentType = PARENT_TYPE.ASSET

    const asset = wrap(new entities.Asset(references.user)).assign(input, { em })
    em.persist(asset)
    return asset
  },
}

const licenceHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.License>>,
  ) => {
    const license = wrap(new entities.License(references.user)).assign(data, { em })
    em.persist(license)
    return license
  },
  createForAsset: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
      asset: InstanceType<typeof entities.Asset>
    },
    data?: Partial<InstanceType<typeof entities.License>>,
  ) => {
    const license = wrap(new entities.License(references.user)).assign(data, { em })
    em.persist(license)
    const licensedItem = wrap(new entities.LicensedItem(license, references.asset.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItem)
    return license
  }
}

const userHelper = {
  create: (em: EntityManager, data?: Partial<InstanceType<typeof entities.User>>) => {
    const org = wrap(new entities.Organization()).assign({
      handle: `org-${generate.random.dxstr()}`,
      name: generate.random.chance.name(),
    })
    em.persist(org)
    const defaults = generate.user.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const user = wrap(new entities.User(org)).assign(input, { em })
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
    const adminMembership = wrap(new entities.AdminMembership(user, adminGroup)).assign({}, {em})
    em.persist(adminMembership)
    return user
  },

  createSiteAdmin: (em: EntityManager) => {
    const user = userHelper.create(em)
    const adminGroup = adminGroupHelper.createSiteAdminGroup(em)
    const adminMembership = wrap(new entities.AdminMembership(user, adminGroup)).assign({}, {em})
    em.persist(adminMembership)
    return user
  },

  createChallengeAdmin: (em: EntityManager) => {
    const user = userHelper.create(em)
    const adminGroup = adminGroupHelper.createChallengeAdminGroup(em)
    const adminMembership = wrap(new entities.AdminMembership(user, adminGroup)).assign({}, {em})
    em.persist(adminMembership)
    return user
  },

  createChallengeBot: (em: EntityManager) => {
    const user = userHelper.create(em, {
      dxuser: config.platform.challengeBotUser,
    })
    return user
  },

  getChallengeBotToken: () => config.platform.challengeBotAccessToken
}

const adminGroupHelper = {
  createReviewSpaceAdminGroup: (
    em: EntityManager
  ) => {
    const RSAGroup = wrap(new entities.AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN,
    })
    em.persist(RSAGroup)
    return RSAGroup
  },

  createSiteAdminGroup: (
    em: EntityManager
  ) => {
    const group = wrap(new entities.AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
    })
    em.persist(group)
    return group
  },

  createChallengeAdminGroup: (
    em: EntityManager
  ) => {
    const group = wrap(new entities.AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN,
    })
    em.persist(group)
    return group
  },
}

const dbClusterHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.DbCluster>>,
  ) => {
    const defaults = generate.dbCluster.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const dbCluster = wrap(new entities.DbCluster(references.user)).assign(input, { em })
    em.persist(dbCluster)
    return dbCluster
  },
}

const jobHelper = {
  create: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
      app?: InstanceType<typeof entities.App>
    },
    data?: Partial<InstanceType<typeof entities.Job>>,
  ) => {
    const defaults = references.app?.isHTTPS() ? generate.job.simple() : generate.job.regular()
    const input = {
      ...defaults,
      ...data,
    }
    const job = wrap(new entities.Job(references.user, references.app)).assign(input, { em })
    em.persist(job)
    return job
  },
}

const appHelper = {
  createRegular: (
    em: EntityManager,
    references: { user: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.App>>,
  ) => {
    const defaults = generate.app.regular()
    const input = {
      ...defaults,
      ...data,
    }
    const app = wrap(new entities.App(references.user)).assign(input, { em })
    em.persist(app)
    return app
  },
  createHTTPS: (
    em: EntityManager,
    references: { user: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.App>>,
  ) => {
    const defaults = generate.app.https()
    const input = {
      ...defaults,
      ...data,
    }
    const app = wrap(new entities.App(references.user)).assign(input, { em })
    em.persist(app)
    return app
  },
  createWithSpace: (
    em: EntityManager,
    references: { user: InstanceType<typeof entities.User> },
    appData: Partial<InstanceType<typeof entities.App>>,
    spaceData: Partial<InstanceType<typeof entities.Space>>,
  ) => {
    const appDefaults = generate.app.regular()
    const appInput = {
      ...appDefaults,
      ...appData,
    }
    const space = wrap(new entities.Space()).assign(spaceData, { em })
    em.persist(space)
    const app = wrap(new entities.App(references.user)).assign(appInput, { em })
    app.scope = getScopeFromSpaceId(space.id)
    em.persist(app)
    return app
  },
}

const filesHelper = {
  create: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
      parentFolder?: InstanceType<typeof entities.Folder>
      parent?: InstanceType<typeof entities.UserFile>
    },
    data?: Partial<InstanceType<typeof entities.UserFile>>,
  ) => {
    const defaults = generate.userFile.simple(data?.dxid)
    const input = {
      ...defaults,
      ...data,
    }
    if (references.parent) {
      input.parentId = references.parent.id
    }
    const file = wrap(new entities.UserFile(references.user)).assign(input, { em })
    if (references.parentFolder) {
      file.parentFolder = references.parentFolder
    }
    em.persist(file)
    return file
  },
  createUploaded: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
      parentFolder?: InstanceType<typeof entities.Folder>
    },
    data?: Partial<InstanceType<typeof entities.UserFile>>,
  ) => {
    const defaults = generate.userFile.simpleUploaded(data?.dxid)
    const input = {
      ...defaults,
      ...data,
      parentId: references.user.id,
    }
    const file = wrap(new entities.UserFile(references.user)).assign(input, { em })
    if (references.parentFolder) {
      file.parentFolder = references.parentFolder
    }
    em.persist(file)
    return file
  },
  createUploadedAsset: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
    },
    data?: Partial<InstanceType<typeof entities.Asset>>,
  ) => {
    const defaults = generate.asset.simple(data?.dxid)
    const input = {
      ...defaults,
      ...data,
      parentId: references.user.id,
    }
    const file = wrap(new entities.Asset(references.user)).assign(input, { em })
    em.persist(file)
    return file
  },
  createJobOutput: (
    em: EntityManager,
    params: {
      user: InstanceType<typeof entities.User>
      jobId: number
    },
    data?: Partial<InstanceType<typeof entities.UserFile>>,
  ) => {
    const defaults = generate.userFile.simpleJobOutput(params.jobId, data?.dxid)
    const input = {
      ...defaults,
      ...data,
    }
    const file = wrap(new entities.UserFile(params.user)).assign(input, { em })
    em.persist(file)
    return file
  },
  createComparisonOutput: (
    em: EntityManager,
    params: {
      user: InstanceType<typeof entities.User>
      comparisonId: number
    },
    data?: Partial<InstanceType<typeof entities.UserFile>>,
  ) => {
    const defaults = generate.userFile.simpleComparisonOutput(params.comparisonId, data?.dxid)
    const input = {
      ...defaults,
      ...data,
    }
    const file = wrap(new entities.UserFile(params.user)).assign(input, { em })
    em.persist(file)
    return file
  },
  createFolder: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
      parentFolder?: InstanceType<typeof entities.Folder>
    },
    data?: Partial<InstanceType<typeof entities.Folder>>,
  ) => {
    const defaults = generate.folder.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const folder = wrap(new entities.Folder(references.user)).assign(input)
    if (references.parentFolder) {
      folder.parentFolder = references.parentFolder
    }
    em.persist(folder)
    return folder
  },
  createLocalOnlyFolder: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
      parentFolder?: InstanceType<typeof entities.Folder>
    },
    data?: Partial<InstanceType<typeof entities.Folder>>,
  ) => {
    const defaults = generate.folder.simpleLocal()
    const input = {
      ...defaults,
      ...data,
    }
    const folder = wrap(new entities.Folder(references.user)).assign(input)
    if (references.parentFolder) {
      folder.parentFolder = references.parentFolder
    }
    em.persist(folder)
    return folder
  },
}

const tagsHelper = {
  create: (em: EntityManager, data?: Partial<InstanceType<typeof entities.Tag>>) => {
    const defaults = generate.tag.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const newTag = wrap(new entities.Tag()).assign(input)
    em.persist(newTag)
    return newTag
  },
  createTagging: (
    em: EntityManager,
    references: { tag: InstanceType<typeof entities.Tag> },
    data?: Partial<InstanceType<typeof entities.Tagging>>,
  ) => {
    const defaults = generate.tagging.userfileDefaults()
    const input = {
      ...defaults,
      tag: references.tag,
      ...data,
    }
    const tagging = new entities.Tagging()
    wrap(tagging).assign(input, { em })
    references.tag.taggings.add(tagging)
    references.tag.taggingCount++
    em.persist(tagging)
    return tagging
  },
}

const spacesHelper = {
  create: (em: EntityManager, data?: Partial<InstanceType<typeof entities.Space>>) => {
    const defaults = generate.space.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const space = wrap(new entities.Space()).assign(input)
    em.persist(space)
    return space
  },
  addMember: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
      space: InstanceType<typeof entities.Space>
    },
    data?: Partial<InstanceType<typeof entities.SpaceMembership>>,
  ) => {
    const defaults = generate.spaceMembership.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const membership = wrap(new entities.SpaceMembership(references.user, references.space)).assign(
      input,
    )
    em.persist(membership)
    return membership
  },
  createEvent: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
      space: InstanceType<typeof entities.Space>
    },
    data?: Partial<InstanceType<typeof entities.SpaceEvent>>,
  ) => {
    const defaults = generate.spaceEvent.contentAdded()
    const input = {
      ...defaults,
      ...data,
    }
    const event = wrap(new entities.SpaceEvent(references.user, references.space)).assign(input)
    em.persist(event)
    return event
  },
}

const challengeHelper = {
  create: (
    em: EntityManager,
    references: { userAndAdmin: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.Challenge>>,
  ) => {
    const defaults = generate.challenge.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const challenge = wrap(
      new entities.Challenge(references.userAndAdmin, references.userAndAdmin),
    ).assign(input)
    em.persist(challenge)
    return challenge
  },
}

const challengeResourceHelper = {
  create: (
    em: EntityManager,
    references: {
      user?: InstanceType<typeof entities.User>
      challenge?: InstanceType<typeof entities.Challenge>
      file?: InstanceType<typeof entities.UserFile>
    },
    data?: Partial<InstanceType<typeof entities.ChallengeResource>>,
  ) => {
    const input = {
      ...data,
    }
    const challengeResource = wrap(new entities.ChallengeResource()).assign(input, { em })
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
    references: { user: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.Comment>>,
  ) => {
    const defaults = generate.comment.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const comment = wrap(new entities.Comment(references.user)).assign(input)
    em.persist(comment)
    return comment
  },
}

const comparisonHelper = {
  create: (
    em: EntityManager,
    references: {
      app: InstanceType<typeof entities.App>
      user: InstanceType<typeof entities.User>
    },
    data?: Partial<InstanceType<typeof entities.Comparison>>,
  ) => {
    const defaults = generate.comparison.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const comparison = wrap(new entities.Comparison(references.user, references.app)).assign(input)
    em.persist(comparison)
    return comparison
  },
}

const expertHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.Comment>>,
  ): Expert => {
    const defaults = generate.expert.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const expert = wrap(new entities.Expert(references.user)).assign(input)
    em.persist(expert)
    return expert
  },
}

const workflowHelper = {
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.Workflow>>,
  ) => {
    const workflow = wrap(new entities.Workflow(references.user)).assign(data, { em })
    em.persist(workflow)
    return workflow
  },
}

export {
  assetHelper,
  userHelper,
  jobHelper,
  appHelper,
  acceptedLicenseHelper,
  filesHelper,
  tagsHelper,
  licenceHelper,
  spacesHelper,
  commentHelper,
  challengeHelper,
  challengeResourceHelper,
  comparisonHelper,
  dbClusterHelper,
  expertHelper,
  workflowHelper,
}
