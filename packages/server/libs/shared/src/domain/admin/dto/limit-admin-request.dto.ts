import { AdminRequestDTO } from '@shared/domain/admin/dto/admin-request.dto'
import { IsNumber, Min } from 'class-validator'

export class LimitAdminRequestDTO extends AdminRequestDTO {
  @IsNumber()
  @Min(0)
  limit: number
}
