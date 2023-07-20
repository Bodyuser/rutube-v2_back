import { IsString } from 'class-validator'

export class CreateCategoryDto {
	@IsString({ message: 'Название должно быть строкой' })
	title: string

	@IsString({ message: 'Изображение должно быть строкой' })
	imagePath: string

	@IsString({ message: 'Слаг должен быть строкой' })
	slug: string
}
