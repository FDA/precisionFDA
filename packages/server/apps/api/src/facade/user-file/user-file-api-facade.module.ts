import { Module } from '@nestjs/common'
import { UserFileResolverFacade } from './user-file-resolver.facade'

@Module({
  imports: [],
  providers: [UserFileResolverFacade],
  exports: [UserFileResolverFacade],
})
export class UserFileApiFacadeModule {}
