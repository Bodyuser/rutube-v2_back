import {
	IsArray,
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator'

export class UpdateVideoDto {
	@IsString({ message: 'Название должно быть строкой' })
	title: string

	@IsString({ message: 'Слаг должен быть строкой' })
	slug: string

	@IsString({ message: 'Описание должно быть строкой' })
	description: string

	@IsString({ message: 'Видео должно быть строкой' })
	videoPath: string

	@IsString({ message: 'Баннер должен быть строкой' })
	bannerPath: string

	@IsString({ message: 'Категория должна быть строкой' })
	category: string

	@IsNumber(
		{},
		{ message: 'Минимальные ограничения по возрасту должен быть числом' }
	)
	minAgeRestrictions: number

	@IsNumber({}, { message: 'Продолжительность должна быть числом' })
	duration: number

	@IsBoolean({ message: 'Приватность должна быть логическим типом' })
	isPrivate: boolean

	@IsArray({ message: 'Тэги должны быть массивом' })
	@IsString({ each: true, message: 'Тэги должны быть строками' })
	@IsOptional()
	tags: string[]
}
