import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { PlatformClient } from '@shared/platform-client'
import { PlatformClientFunctionKeyType } from '../model/platform-client-function-key.type'

@Injectable()
export class AdminPlatformClientService {
  private readonly ALLOWED_METHODS: PlatformClientFunctionKeyType[] = [
    'createOrg',
    'projectCreate',
    'projectInvite',
    'projectDescribe',
    'projectLeave',
    'removeUserFromOrganization',
    'inviteUserToOrganization',
    'jobDescribe',
  ]

  constructor(private readonly platformClient: PlatformClient) {}

  async execute(method: string, params: unknown[]): Promise<unknown> {
    if (typeof this.platformClient[method] !== 'function') {
      throw new BadRequestException('Invalid method')
    }

    if (!(this.ALLOWED_METHODS as string[]).includes(method)) {
      throw new ForbiddenException(
        `Method "${method}" is not allowed to be called on the admin platform client`,
      )
    }

    return await this.platformClient[method](...params)
  }
}
