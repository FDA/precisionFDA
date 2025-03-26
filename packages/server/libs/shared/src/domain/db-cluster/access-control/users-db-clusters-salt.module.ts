import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { UsersDbClustersSalt } from './users-db-clusters-salt.entity'

@Module({
  imports: [MikroOrmModule.forFeature([UsersDbClustersSalt])],
  exports: [MikroOrmModule],
})
export class UsersDbClustersSaltModule {}
