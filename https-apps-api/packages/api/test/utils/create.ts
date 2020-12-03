import { EntityManager, wrap } from '@mikro-orm/core'
import { entities } from '@pfda/https-apps-shared'
import * as generate from './generate'

const userHelper = {
  create: (em: EntityManager, data?: Partial<typeof entities.User>) => {
    const defaults = generate.user.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const user = wrap(new entities.User()).assign(input, { em })
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
    references: { user: InstanceType<typeof entities.User> },
    data?: Partial<InstanceType<typeof entities.UserFile>>,
  ) => {
    const defaults = generate.userFile.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const file = wrap(new entities.UserFile(references.user)).assign(input, { em })
    em.persist(file)
    return file
  },
}

export { userHelper, jobHelper, appHelper, filesHelper }
