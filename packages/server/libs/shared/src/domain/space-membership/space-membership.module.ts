import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { SpaceMembership } from './space-membership.entity'
import { SpaceMembershipService } from './space-membership.service'

@Module({
  imports: [MikroOrmModule.forFeature([SpaceMembership])],
  providers: [SpaceMembershipService],
  exports: [SpaceMembershipService, MikroOrmModule],
})
export class SpaceMembershipModule {}
