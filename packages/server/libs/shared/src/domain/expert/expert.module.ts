import { Module } from '@nestjs/common'

import { ExpertService } from '@shared/domain/expert/services/expert.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Expert } from '@shared/domain/expert/expert.entity'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'
import { UserFile } from '@shared/domain/user-file/user-file.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Expert, UserFile]), RemoveNodesFacadeModule],
  providers: [ExpertService],
  exports: [ExpertService, MikroOrmModule],
})
export class ExpertModule {}
