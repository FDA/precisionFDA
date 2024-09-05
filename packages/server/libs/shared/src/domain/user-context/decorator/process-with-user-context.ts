import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'

export function ProcessInUserContext(descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = function (job: { data: { user?: UserContext } }, ...args: unknown[]) {
    const user = job?.data?.user

    const userContext = new UserContext(user?.id, user?.accessToken, user?.dxuser)

    return userContextStorage.run(userContext, () => {
      return originalMethod.apply(this, [job, ...args])
    })
  }

  return descriptor
}
