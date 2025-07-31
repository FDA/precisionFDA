import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'

export class AcceptedLicenseRepository extends PaginatedRepository<AcceptedLicense> {}
