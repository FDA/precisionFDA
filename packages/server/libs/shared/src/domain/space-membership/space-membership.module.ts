import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { SpaceMembership } from './space-membership.entity'

@Module({
  imports: [MikroOrmModule.forFeature([SpaceMembership])],
  exports: [MikroOrmModule],
})
export class SpaceMembershipModule {}
