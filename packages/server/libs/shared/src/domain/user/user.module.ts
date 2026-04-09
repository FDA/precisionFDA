import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { UserService } from '@shared/domain/user/service/user.service'
import { UserManagementService } from '@shared/domain/user/service/user-management.service'
import { User } from '@shared/domain/user/user.entity'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { Organization } from '../org/organization.entity'

@Module({
  imports: [EmailModule, MikroOrmModule.forFeature([User, Organization]), PlatformClientModule],
  providers: [UserService, UserManagementService],
  exports: [UserService, UserManagementService, MikroOrmModule],
})
export class UserModule {}
