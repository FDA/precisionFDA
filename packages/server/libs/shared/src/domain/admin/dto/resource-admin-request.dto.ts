import { IsEnum } from 'class-validator'
import { AdminRequestDTO } from '@shared/domain/admin/dto/admin-request.dto'
import { RESOURCE_TYPES, Resource } from '@shared/domain/user/user.entity'

export class ResourceAdminRequestDTO extends AdminRequestDTO {
  @IsEnum(RESOURCE_TYPES)
  resource: Resource
}
