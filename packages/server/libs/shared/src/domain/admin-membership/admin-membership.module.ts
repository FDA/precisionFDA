import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AdminGroup } from '@shared/domain/admin-group/admin-group.entity'
import { AdminMembership } from '@shared/domain/admin-membership/admin-membership.entity'
import { AdminMembershipService } from '@shared/domain/admin-membership/service/admin-membership.service'

@Module({
  imports: [MikroOrmModule.forFeature([AdminMembership, AdminGroup])],
  providers: [AdminMembershipService],
  exports: [AdminMembershipService],
})
export class AdminMembershipModule {}
