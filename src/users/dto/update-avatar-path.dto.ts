import { IsString } from 'class-validator'

export class UpdateAvatarPathDto {
	@IsString({ message: 'Аватарка должна быть строкой' })
	avatarPath: string
}
