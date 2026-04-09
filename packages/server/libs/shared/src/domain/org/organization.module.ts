import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Organization } from '@shared/domain/org/organization.entity'
import { OrganizationService } from '@shared/domain/org/service/organization.service'

@Module({
  imports: [MikroOrmModule.forFeature([Organization])],
  providers: [OrganizationService],
  exports: [OrganizationService, MikroOrmModule],
})
export class OrganizationModule {}
