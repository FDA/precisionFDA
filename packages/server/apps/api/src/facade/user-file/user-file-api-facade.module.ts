import { Module } from '@nestjs/common'
import { UserFileResolverFacade } from './user-file-resolver.facade'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileDownloadFacade } from './user-file-download.facade'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { SpaceModule } from '@shared/domain/space/space.module'

@Module({
  imports: [MikroOrmModule.forFeature([UserFile]), UserFileModule, SpaceModule],
  providers: [UserFileResolverFacade, UserFileDownloadFacade],
  exports: [UserFileResolverFacade, UserFileDownloadFacade],
})
export class UserFileApiFacadeModule {}
