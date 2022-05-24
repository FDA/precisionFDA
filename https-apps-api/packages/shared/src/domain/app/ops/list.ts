import { App } from '../app.entity'
import { User } from '../../user'
import { BaseOperation, DefaultInput } from '../../../utils'
import { UserOpsCtx } from '../../../types'

export class ListAppsOperation extends BaseOperation<UserOpsCtx, DefaultInput, App[]> {
  async run() {
    // all the https-type apps that somehow belong to given user
    const em = this.ctx.em
    // todo: the ownership is probably more sophisticated that this
    // todo: add implicit "type" filter here once it is in the database
    const apps = await em.find(App, { user: em.getReference(User, this.ctx.user.id) })
    return apps
  }
}
