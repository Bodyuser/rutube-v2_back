import { IsEnum, IsOptional, IsString } from 'class-validator'

export enum DateEnum {
	ALL = 'all',
	TODAY = 'today',
	WEEK = 'week',
	MONTH = 'month',
	YEAR = 'year',
}

export enum DurationEnum {
	ALL = 'all',
	SHORT = 'short',
	MEDIUM = 'medium',
	LONG = 'long',
	MOVIE = 'movie',
}

export enum OrderEnum {
	NEWEST = 'newest',
	OLDEST = 'oldest',
	VIEWS = 'views',
}

export class GetAllVideosDto {
	@IsEnum(DateEnum, {
		message: 'Дата должна быть валидной',
	})
	@IsOptional()
	date: DateEnum

	@IsEnum(DurationEnum, {
		message: 'Продолжительность должна быть валидной',
	})
	@IsOptional()
	duration: DurationEnum

	@IsEnum(OrderEnum, {
		message: 'Ордер должен быть валидным',
	})
	@IsOptional()
	order: OrderEnum

	@IsString({ message: 'Поиск должен быть строкой' })
	query: string
}
