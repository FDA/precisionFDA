import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { User } from '@shared/domain/user/user.entity'
import { UserService } from '@shared/domain/user/user.service'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { Organization } from '../org/org.entity'

@Module({
  imports: [EmailModule, MikroOrmModule.forFeature([User, Organization]), PlatformClientModule],
  providers: [UserService],
  exports: [UserService, MikroOrmModule],
})
export class UserModule {}
