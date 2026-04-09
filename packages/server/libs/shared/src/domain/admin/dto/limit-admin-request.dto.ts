import { IsNumber, Min } from 'class-validator'
import { AdminRequestDTO } from '@shared/domain/admin/dto/admin-request.dto'

export class LimitAdminRequestDTO extends AdminRequestDTO {
  @IsNumber()
  @Min(0)
  limit: number
}
