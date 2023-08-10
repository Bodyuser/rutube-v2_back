import { IsString } from 'class-validator'

export class GoogleDto {
	@IsString({ message: 'Токен должен быть строкой' })
	token: string
}
