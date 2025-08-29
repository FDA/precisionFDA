import { IsEnum } from 'class-validator'
import { RESOURCE_TYPES, Resource } from '@shared/domain/user/user.entity'
import { AdminRequestDTO } from '@shared/domain/admin/dto/admin-request.dto'

export class ResourceAdminRequestDTO extends AdminRequestDTO {
  @IsEnum(RESOURCE_TYPES)
  resource: Resource
}
