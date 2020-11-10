import { NotFoundError } from '@mikro-orm/core'
import { BaseOperation } from '../../utils'
import { User } from '../user.entity'

export class FindUserOperation extends BaseOperation<{ id: number }, User> {
  async run({ id }) {
    const usersRepository = this.ctx.em.getRepository(User)
    const user = await usersRepository.findOne(id)
    if (!user) {
      throw new NotFoundError('user not found. should have custom code')
    }
    return user
  }
}
