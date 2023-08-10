import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Put,
	UsePipes,
	Req,
	ValidationPipe,
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateCommentDto } from './dto/create-comment.dto'
import { User } from 'src/users/decorators/user.decorator'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { Request } from 'express'

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

	@Patch('toggle-like/:id')
	@Auth()
	async toggleLikeComment(@Param('id') id: string, @User('id') userId: string) {
		return await this.commentsService.toggleLikeComment(id, userId)
	}

	@Patch('toggle-dislike/:id')
	@Auth()
	async toggleDisLikeComment(
		@Param('id') id: string,
		@User('id') userId: string
	) {
		return await this.commentsService.toggleDisLikeComment(id, userId)
	}

	@Get('reply-comments/:id')
	async getReplyCommentsByCommentId(
		@Param('id') id: string,
		@Req() req: Request
	) {
		return await this.commentsService.getReplyCommentsByCommentId(
			id,
			req.headers.authorization,
			req.cookies.refreshToken
		)
	}

	@Get(':id')
	async getCommentsByVideo(@Param('id') id: string, @Req() req: Request) {
		return await this.commentsService.getCommentsByVideoId(
			id,
			req.headers.authorization,
			req.cookies.refreshToken
		)
	}
}
