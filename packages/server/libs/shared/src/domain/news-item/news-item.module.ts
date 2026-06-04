import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { NewsItem } from './news-item.entity'
import { NewsItemService } from './service/news-item.service'

@Module({
  imports: [MikroOrmModule.forFeature([NewsItem])],
  providers: [NewsItemService],
  exports: [NewsItemService],
})
export class NewsItemModule {}
