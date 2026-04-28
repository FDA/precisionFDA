import { MikroOrmModule } from '@mikro-orm/nestjs'
import { OrgActionRequest } from '@shared/domain/org-action-request/org-action-request.entity'
import { OrganizationService } from '@shared/domain/org/service/organization.service'
import { Module } from '@nestjs/common'
import { Organization } from '@shared/domain/org/organization.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Organization, OrgActionRequest])],
  providers: [OrganizationService],
  exports: [OrganizationService, MikroOrmModule],
})
export class OrganizationModule {}
