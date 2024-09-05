import { Module } from '@nestjs/common'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { EmailModule } from '@shared/domain/email/email.module'

@Module({
  imports: [PlatformClientModule, EmailModule],
  providers: [DbClusterService],
  exports: [DbClusterService],
})
export class DbClusterModule {}
