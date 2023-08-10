import {
	IsEmail,
	IsNumber,
	IsOptional,
	IsString,
	IsStrongPassword,
} from 'class-validator'

export class UpdateProfileDto {
	@IsEmail({}, { message: 'Почта должна быть валидной' })
	@IsOptional()
	email: string

	@IsString({ message: 'Имя должно быть строкой' })
	name: string

	@IsString({ message: 'Страна должна быть строкой' })
	@IsOptional()
	country: string

	@IsString({ message: 'Дата рождения должна быть строкой' })
	@IsOptional()
	dateOfBirth: string

	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 3,
			minNumbers: 2,
			minSymbols: 1,
			minUppercase: 1,
		},
		{ message: 'Password field must be difficult' }
	)
	@IsOptional()
	password: string

	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 3,
			minNumbers: 2,
			minSymbols: 1,
			minUppercase: 1,
		},
		{
			message:
				'Пароль должен содержать как минимум 8 символов, как минимум 1 заглавной буквы, как минимум 3 незаглавной буквы, как минимум 1 символ, как минимум 2 цифры',
		}
	)
	@IsOptional()
	currentPassword: string

	@IsString({ message: 'О себе должен быть строкой' })
	@IsOptional()
	about: string

	@IsString({ message: 'Пол должен быть строкой' })
	@IsOptional()
	gender: string

	@IsNumber({}, { message: 'Код должен быть числом' })
	@IsOptional()
	code: number
}
