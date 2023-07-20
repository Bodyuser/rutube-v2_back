import { IsString } from 'class-validator'

export class UpdateCommentDto {
	@IsString({ message: 'Text field must be a string' })
	text: string
}
