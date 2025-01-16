import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { User } from '@shared/domain/user/user.entity'
import { UserService } from '@shared/domain/user/user.service'

@Module({
  imports: [EmailModule, MikroOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService, MikroOrmModule],
})
export class UserModule {}
