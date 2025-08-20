import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { License } from '@shared/domain/license/license.entity'

export class LicenseRepository extends PaginatedRepository<License> {}
