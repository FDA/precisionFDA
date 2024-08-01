import { Module } from '@nestjs/common'
import { UserModule } from '@shared/domain/user/user.module'
import { UsersController } from './users.controller'

@Module({
  imports: [UserModule],
  controllers: [UsersController],
})
export class UsersApiModule {}
