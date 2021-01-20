import { EntityManager, wrap } from '@mikro-orm/core'
import { entities } from '../../domain'
import * as generate from './generate'

const userHelper = {
  create: (em: EntityManager, data?: Partial<typeof entities.User>) => {
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
    const defaults = generate.job.simple()
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
  create: (
    em: EntityManager,
    references: { user: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.App>>,
  ) => {
    const defaults = generate.app.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const app = wrap(new entities.App(references.user)).assign(input, { em })
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
    },
    data?: Partial<InstanceType<typeof entities.UserFile>>,
  ) => {
    const defaults = generate.userFile.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const file = wrap(new entities.UserFile(references.user, references.parentFolder)).assign(
      input,
      { em },
    )
    em.persist(file)
    return file
  },
  createFolder: (
    em: EntityManager,
    references: {
      user: InstanceType<typeof entities.User>
      parent?: InstanceType<typeof entities.Folder>
    },
    data?: Partial<InstanceType<typeof entities.UserFile>>,
  ) => {
    const defaults = generate.folder.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const folder = wrap(new entities.Folder(references.user, references.parent)).assign(input)
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

export { userHelper, jobHelper, appHelper, filesHelper, tagsHelper }
