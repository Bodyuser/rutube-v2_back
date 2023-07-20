import { IsEmail, IsString } from 'class-validator'

export class FacebookDto {
	@IsEmail({}, { message: 'Почта должна быть правильной' })
	email: string

	@IsString({ message: 'Изображение должно быть строкой' })
	picture: string
}
