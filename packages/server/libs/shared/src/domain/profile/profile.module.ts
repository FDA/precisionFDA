import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Profile } from './profile.entity'
import { ProfileService } from './service/profile.service'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [PlatformClientModule, MikroOrmModule.forFeature([Profile])],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
