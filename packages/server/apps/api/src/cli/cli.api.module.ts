import { Module } from '@nestjs/common'
import { CliModule } from '@shared/domain/cli/cli.module'
import { CliController } from './cli.controller'
import { CliApiFacadeModule } from '../facade/cli/cli-api-facade.module'
import { DiscussionApiFacadeModule } from '../facade/discussion/discussion-api-facade.module'

@Module({
  imports: [CliModule, CliApiFacadeModule, DiscussionApiFacadeModule],
  controllers: [CliController],
})
export class CliApiModule {}
