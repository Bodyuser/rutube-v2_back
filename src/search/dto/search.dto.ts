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

export class SearchDto {
	date: DateEnum

	duration: DurationEnum

	order: OrderEnum

	query: string
}
