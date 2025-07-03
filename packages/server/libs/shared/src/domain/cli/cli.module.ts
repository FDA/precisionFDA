import { Module } from '@nestjs/common'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'

@Module({
  imports: [DbClusterModule],
  providers: [CliService],
  exports: [CliService],
})
export class CliModule {}
