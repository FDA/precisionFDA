import { Module } from '@nestjs/common'
import { NewsController } from './news.controller'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'

@Module({
  imports: [MikroOrmModule.forFeature([NewsItem])],
  controllers: [NewsController],
})
export class NewsApiModule {}
