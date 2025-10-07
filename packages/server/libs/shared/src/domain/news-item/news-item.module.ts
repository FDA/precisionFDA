import { Module } from '@nestjs/common'

import { MikroOrmModule } from '@mikro-orm/nestjs'
import { NewsItem } from './news-item.entity'
import { NewsService } from './service/new-item.service'

@Module({
  imports: [MikroOrmModule.forFeature([NewsItem])],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
