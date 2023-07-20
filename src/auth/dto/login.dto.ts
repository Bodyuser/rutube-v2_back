import { IsEmail, IsStrongPassword } from 'class-validator'

export class LoginDto {
	@IsEmail({}, { message: 'Почта должна быть правильной' })
	email: string

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
	password: string
}
