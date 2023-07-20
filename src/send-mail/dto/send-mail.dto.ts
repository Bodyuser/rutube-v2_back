import { IsEmail } from 'class-validator'

export class SendMailDto {
	@IsEmail({}, { message: 'Почта должна быть валидной' })
	email: string
}
