import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { OrganizationService } from '@shared/domain/org/service/organization.service'
import { Organization } from '@shared/domain/org/organization.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Organization])],
  providers: [OrganizationService],
  exports: [OrganizationService, MikroOrmModule],
})
export class OrganizationModule {}
