import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { Type } from 'class-transformer'

export enum PUBLICATION_TYPE {
  PUBLICATION = 'publication',
  ARTICLE = 'article',
}

export class NewsListDTO extends PaginationDTO<NewsItem> {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  year: number

  @IsOptional()
  @IsEnum(PUBLICATION_TYPE)
  type: PUBLICATION_TYPE
}
