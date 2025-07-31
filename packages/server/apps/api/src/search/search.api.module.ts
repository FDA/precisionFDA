import { Module } from '@nestjs/common'
import { SearchFacadeModule } from '@shared/facade/search/search-facade.module'
import { SearchController } from './search.controller'

@Module({
  imports: [SearchFacadeModule],
  controllers: [SearchController],
})
export class SearchApiModule {}
