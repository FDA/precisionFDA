import { EntityManager, wrap } from '@mikro-orm/core'
import { User } from '../../src/users'
import { Job } from '../../src/jobs'
import { App } from '../../src/apps'
import * as generate from './generate'

const userHelper = {
  create: (em: EntityManager, data?: Partial<User>) => {
    const defaults = generate.user.simple()
    const input = {
      ...defaults,
      ...data,
    }
    const user = wrap(new User()).assign(input, { em })
    em.persist(user)
    return user
  },
}

const jobHelper = {
  create: (em: EntityManager, references: { user: User; app?: App }, data?: Partial<Job>) => {
    const defaults = generate.job.simple()
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
  create: (em: EntityManager, references: { user: User }, data?: Partial<App>) => {
    const input = {
      ...data,
    }
    const app = wrap(new App(references.user)).assign(input, { em })
    em.persist(app)
    return app
  },
}

export { userHelper, jobHelper, appHelper }
