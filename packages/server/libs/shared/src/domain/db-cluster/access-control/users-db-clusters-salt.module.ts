import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { UsersDbClustersSalt } from './users-db-clusters-salt.entity'
import { UsersDbClustersSaltService } from './users-db-clusters-salt.service'

@Module({
  imports: [MikroOrmModule.forFeature([UsersDbClustersSalt])],
  providers: [UsersDbClustersSaltService],
  exports: [UsersDbClustersSaltService, MikroOrmModule],
})
export class UsersDbClustersSaltModule {}
