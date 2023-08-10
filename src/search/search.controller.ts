import { Controller, Get, Query, Req } from '@nestjs/common'
import { SearchService } from './search.service'
import { SearchDto } from './dto/search.dto'
import { Request, Response } from 'express'

@Controller('search')
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Get('')
	async getSearchList() {
		return await this.searchService.getSearchList()
	}

	@Get('result')
	async getSearchResult(@Query() searchDto: SearchDto, @Req() req: Request) {
		return await this.searchService.getSearchResult(
			searchDto,
			req.headers.authorization,
			req.cookies.refreshToken
		)
	}
}
