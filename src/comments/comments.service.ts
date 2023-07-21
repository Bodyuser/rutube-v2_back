import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CommentEntity } from './entities/comment.entity'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UserEntity } from 'src/users/entities/user.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { returnRelationComment } from './returnRelationComment'
import { NotificationsService } from 'src/notifications/notifications.service'

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(CommentEntity)
		private commentRepository: Repository<CommentEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(VideoEntity)
		private videoRepository: Repository<VideoEntity>,
		private notificationsService: NotificationsService
	) {}

	async createComment(
		createCommentDto: CreateCommentDto,
		id: string,
		videoId: string
	) {
		const author = await this.userRepository.findOne({ where: { id } })
		if (!author) throw new NotFoundException('Пользователь не найден')

		const video = await this.videoRepository.findOne({
			where: { id: videoId },
			relations: { author: true },
		})
		if (!video) throw new NotFoundException('Видео не найдено')

		if (createCommentDto.type === 'reply-comment') {
			const mainComment = await this.commentRepository.findOne({
				where: { id: createCommentDto.comment },
				relations: {
					author: true,
				},
			})
			if (!mainComment) throw new NotFoundException('Комментарий не найден')

			const comment = this.commentRepository.create({
				...createCommentDto,
				author,
				mainComment,
				video,
			})

			await this.commentRepository.save(comment)

			await this.notificationsService.createNotification(
				`Пользователь ${author.name} оставил комментарий под вашим комментарием: ${mainComment.text}`,
				'reply-to-comment',
				`/videos/${video.slug}`,
				mainComment.author.id,
				comment.id
			)

			return {
				comment: {
					...comment,
					author: author.returnProfile(),
				},
			}
		}

		const comment = this.commentRepository.create({
			...createCommentDto,
			author,
			video,
		})

		await this.commentRepository.save(comment)

		await this.notificationsService.createNotification(
			`Пользователь ${author.name} оставил комментарий под вашим видео: ${video.title}`,
			'comment-to-video',
			`/videos/${video.slug}`,
			video.author.id,
			comment.id
		)

		return {
			comment: {
				...comment,
				author: comment.author.returnProfile(),
			},
		}
	}

	async updateComment(
		updateCommentDto: UpdateCommentDto,
		id: string,
		userId: string
	) {
		const comment = await this.commentRepository.findOne({
			where: {
				id,
				author: { id: userId },
			},
			relations: returnRelationComment,
		})

		if (!comment) throw new NotFoundException('Комментарий не найден')

		comment.text = updateCommentDto.text

		await this.commentRepository.save(comment)

		return {
			comment: {
				...comment,
				author: comment.author.returnProfile(),
				disLikeUsers: comment.disLikeUsers.map(user => user.returnUser()),
				likeUsers: comment.likeUsers.map(user => user.returnUser()),
			},
		}
	}

	async deleteComment(id: string, userId: string) {
		const comment = await this.commentRepository.findOne({
			where: {
				id,
				author: { id: userId },
			},
			relations: returnRelationComment,
		})

		if (!comment) throw new NotFoundException('Комментарий не найден')

		await this.commentRepository.delete(id)

		return {
			message: 'Комментарий удален',
		}
	}

	async getCommentsByVideo(id: string) {
		const comments = await this.commentRepository.find({
			where: {
				video: {
					id,
				},
				type: 'comment',
			},
			relations: {
				...returnRelationComment,
				replyComments: {
					author: true,
				},
			},
		})

		return {
			comments: comments.map(comment => ({
				...comment,
				author: comment.author.returnUser(),
				likeUsers: comment.likeUsers.map(user => user.returnUser()),
				disLikeUsers: comment.disLikeUsers.map(user => user.returnUser()),
				replyComments: comment.replyComments.map(com => ({
					...com,
					author: com.author.returnUser(),
				})),
			})),
		}
	}
}
