import { IsString, IsIn, IsUUID, ValidateIf } from 'class-validator'

export class CreateCommentDto {
	@IsString({ message: 'Текст должен быть строкой' })
	text: string

	@IsIn(['comment', 'reply-comment'], {
		message: 'Тип должен быть comment или reply-comment',
	})
	type: 'comment' | 'reply-comment'

	@IsUUID('4', { message: 'Комментарий должен быть UUID' })
	@ValidateIf(dto => dto.type === 'reply-comment')
	comment: string
}
