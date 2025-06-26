import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'

export class AcceptedLicenseRepository extends PaginatedRepository<AcceptedLicense> {}
