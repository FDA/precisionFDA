import { Module } from '@nestjs/common'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { DbClusterPasswordFacadeModule } from 'apps/api/src/facade/db-cluster/password-facade/db-cluster-password-facade.module'

@Module({
  imports: [DbClusterPasswordFacadeModule],
  providers: [CliService],
  exports: [CliService],
})
export class CliModule {}
