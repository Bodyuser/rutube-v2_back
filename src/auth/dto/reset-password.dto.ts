import { IsStrongPassword } from 'class-validator'

export class ResetPasswordDto {
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
