import { Module } from '@nestjs/common'
import { NewsModule } from '@shared/domain/news-item/news-item.module'
import { NewsController } from './news.controller'

@Module({
  imports: [NewsModule],
  controllers: [NewsController],
})
export class NewsApiModule {}
