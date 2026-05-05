import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { License } from '@shared/domain/license/license.entity'
import { LicenseService } from '@shared/domain/license/license.service'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { Node } from '@shared/domain/user-file/node.entity'

@Module({
  imports: [MikroOrmModule.forFeature([LicensedItem, Node, License])],
  providers: [LicenseService],
  exports: [LicenseService],
})
export class LicenseModule {}
