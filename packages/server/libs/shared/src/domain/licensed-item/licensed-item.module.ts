import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { LicensedItemService } from '@shared/domain/licensed-item/licensed-item.service'

@Module({
  imports: [MikroOrmModule.forFeature([LicensedItem])],
  providers: [LicensedItemService],
  exports: [LicensedItemService],
})
export class LicensedItemModule {}
