import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { UserRoleEnum } from 'src/users/enums/user-role.enum'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Post('')
	@Auth(UserRoleEnum.ADMIN)
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
		return await this.categoriesService.createCategory(createCategoryDto)
	}

	@Put(':id')
	@Auth(UserRoleEnum.ADMIN)
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async updateCategory(
		@Body() updateCategoryDto: UpdateCategoryDto,
		@Param('id') id: string
	) {
		return await this.categoriesService.updateCategory(updateCategoryDto, id)
	}

	@Delete(':id')
	@Auth(UserRoleEnum.ADMIN)
	async deleteCategory(@Param('id') id: string) {
		return await this.categoriesService.deleteCategory(id)
	}

	@Get('existing-slug/:slug')
	@Auth()
	async checkExistingSlug(@Param('slug') slug: string) {
		return await this.categoriesService.checkExistingSlug(slug)
	}

	@Get('')
	async getCategories() {
		return await this.categoriesService.getCategories()
	}

	@Get(':slug')
	async getCategoryBySlug(@Param('slug') slug: string) {
		return await this.categoriesService.getCategoryBySlug(slug)
	}
}
