import { Controller, Get, Query } from '@nestjs/common'
import { SearchService } from './search.service'
import { SearchDto } from './dto/search.dto'

@Controller('search')
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Get('')
	async getSearchList() {
		return await this.searchService.getSearchList()
	}

	@Get('result')
	async getSearchResult(@Query() searchDto: SearchDto) {
		return await this.searchService.getSearchResult(searchDto)
	}
}
