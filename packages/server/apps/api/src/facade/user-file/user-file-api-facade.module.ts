import { Module } from '@nestjs/common'
import { UserFileResolverFacade } from './user-file-resolver.facade'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { UserFile } from '@shared/domain/user-file/user-file.entity'

@Module({
  imports: [MikroOrmModule.forFeature([UserFile])],
  providers: [UserFileResolverFacade],
  exports: [UserFileResolverFacade],
})
export class UserFileApiFacadeModule {}
