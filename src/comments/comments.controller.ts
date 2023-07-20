import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateCommentDto } from './dto/create-comment.dto'
import { User } from 'src/users/decorators/user.decorator'
import { UpdateCommentDto } from './dto/update-comment.dto'

@Controller('comments')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Post(':videoId')
	@Auth()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async createComment(
		@Body() createCommentDto: CreateCommentDto,
		@Param('videoId') videoId: string,
		@User('id') id: string
	) {
		return await this.commentsService.createComment(
			createCommentDto,
			id,
			videoId
		)
	}

	@Put(':id')
	@Auth()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async updateComment(
		@Body() updateCommentDto: UpdateCommentDto,
		@Param('id') id: string,
		@User('id') userId: string
	) {
		return await this.commentsService.updateComment(
			updateCommentDto,
			id,
			userId
		)
	}

	@Delete(':id')
	@Auth()
	async deleteComment(@Param('id') id: string, @User('id') userId: string) {
		return await this.commentsService.deleteComment(id, userId)
	}

	@Get(':id')
	async getCommentsByVideo(@Param('id') id: string) {
		return await this.commentsService.getCommentsByVideo(id)
	}
}
