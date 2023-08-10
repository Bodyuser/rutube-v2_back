import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { CreateCategoryDto } from './dto/create-category.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoryEntity } from './entities/category.entity'
import { Repository } from 'typeorm'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { returnRelationCategory } from './returnRelationCategory'
import { validate } from 'uuid'

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(CategoryEntity)
		private categoryRepository: Repository<CategoryEntity>
	) {}

	async createCategory(createCategoryDto: CreateCategoryDto) {
		const existSlug = await this.categoryRepository.findOne({
			where: { slug: createCategoryDto.slug },
		})
		if (existSlug) throw new BadRequestException('Слаг занят')

		const category = this.categoryRepository.create(createCategoryDto)

		await this.categoryRepository.save(category)

		return {
			category,
		}
	}

	async updateCategory(updateCategoryDto: UpdateCategoryDto, id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const category = await this.categoryRepository.findOne({
			where: { id },
		})
		if (!category) throw new NotFoundException('Категория не найдена')

		if (category.slug !== updateCategoryDto.slug) {
			const existSlug = await this.categoryRepository.findOne({
				where: { slug: updateCategoryDto.slug },
			})
			if (existSlug) throw new BadRequestException('Слаг занят')

			category.slug = updateCategoryDto.slug
		}

		category.title = updateCategoryDto.title
		category.imagePath = updateCategoryDto.imagePath

		await this.categoryRepository.save(category)

		return {
			category,
		}
	}

	async deleteCategory(id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const category = await this.categoryRepository.findOne({
			where: { id },
		})
		if (!category) throw new NotFoundException('Категория не найдена')

		await this.categoryRepository.delete(id)

		return {
			message: 'Категория удалена',
		}
	}

	async checkExistingSlug(slug: string) {
		const category = await this.categoryRepository.findOne({
			where: { slug },
		})
		if (category) {
			return {
				message: 'Слаг занят',
				access: false,
			}
		}

		return {
			message: 'Слаг свободен',
			access: true,
		}
	}

	async getCategories() {
		const categories = await this.categoryRepository.find()

		return {
			categories,
		}
	}

	async getCategoryBySlug(slug: string) {
		const category = await this.categoryRepository.findOne({
			where: {
				slug,
			},
		})

		if (!category) throw new NotFoundException('Категория не найдена')

		return {
			category,
		}
	}
}
