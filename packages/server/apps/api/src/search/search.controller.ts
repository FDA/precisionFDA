import { Controller, Get, Query } from '@nestjs/common'
import { SearchDTO } from '@shared/facade/search/domain/search.dto'
import { SearchResultDTO } from '@shared/facade/search/domain/search-result-d-t.o'
import { SearchFacade } from '@shared/facade/search/search.facade'

@Controller('search')
export class SearchController {
  constructor(private readonly searchFacade: SearchFacade) {}

  @Get()
  search(@Query() searchDto: SearchDTO): Promise<SearchResultDTO[]> {
    return this.searchFacade.search(searchDto.query, searchDto.entityType)
  }
}
