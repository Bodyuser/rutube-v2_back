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
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(CommentEntity)
		private commentRepository: Repository<CommentEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(VideoEntity)
		private videoRepository: Repository<VideoEntity>,
		private notificationsService: NotificationsService,
		private jwtService: JwtService
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
		})

		if (!comment) throw new NotFoundException('Комментарий не найден')

		comment.text = updateCommentDto.text

		await this.commentRepository.save(comment)

		return {
			comment,
		}
	}

	async deleteComment(id: string, userId: string) {
		const comment = await this.commentRepository.findOne({
			where: {
				id,
				author: { id: userId },
			},
			relations: {
				author: true,
			},
		})

		if (!comment) throw new NotFoundException('Комментарий не найден')

		await this.commentRepository.delete(id)

		return {
			message: 'Комментарий удален',
		}
	}

	async getCommentsByVideoId(
		id: string,
		authHeader?: string,
		refreshToken?: string
	) {
		const comments = await this.commentRepository.find({
			where: {
				video: {
					id,
				},
				type: 'comment',
			},
			relations: {
				...returnRelationComment,
			},
		})

		let accessData: any = null
		let refreshData: any = null

		if (authHeader && refreshToken) {
			if (authHeader.startsWith('Bearer')) {
				accessData = await this.jwtService.verifyAsync(authHeader.split(' ')[1])
			}
			refreshData = await this.jwtService.verifyAsync(refreshToken)
		}

		let resultComments: any[] = null

		if (
			accessData &&
			refreshData &&
			accessData?.userId &&
			refreshData?.userId &&
			accessData?.userId === refreshData?.userId
		) {
			const user = await this.userRepository.findOne({
				where: { id: accessData?.userId },
			})

			if (!user) {
				resultComments = comments.map(comment => ({
					...comment,
					author: comment.author.returnUser(),
					countLike: comment.likeUsers.length,
					countDisLike: comment.disLikeUsers.length,
				}))
			} else {
				resultComments = comments.map(comment => ({
					...comment,
					author: comment.author.returnUser(),
					countLike: comment.likeUsers.length,
					countDisLike: comment.disLikeUsers.length,
					isLike: comment.likeUsers.some(u => u.id === user.id),
					isDisLike: comment.disLikeUsers.some(u => u.id === user.id),
				}))
			}
		} else {
			resultComments = comments.map(comment => ({
				...comment,
				author: comment.author.returnUser(),
				countLike: comment.likeUsers.length,
				countDisLike: comment.disLikeUsers.length,
			}))
		}

		resultComments.forEach(c => {
			delete c.likeUsers
			delete c.disLikeUsers
		})

		return {
			comments: resultComments,
		}
	}

	async getReplyCommentsByCommentId(
		id: string,
		authHeader?: string,
		refreshToken?: string
	) {
		const comments = await this.commentRepository.find({
			where: {
				mainComment: {
					id,
				},
				type: 'reply-comment',
			},
			relations: {
				...returnRelationComment,
			},
		})
		let accessData: any = null
		let refreshData: any = null

		if (authHeader && refreshToken) {
			if (authHeader.startsWith('Bearer')) {
				accessData = await this.jwtService.verifyAsync(authHeader.split(' ')[1])
			}
			refreshData = await this.jwtService.verifyAsync(refreshToken)
		}

		let resultComments: any[] = null

		if (
			accessData &&
			refreshData &&
			accessData?.userId &&
			refreshData?.userId &&
			accessData?.userId === refreshData?.userId
		) {
			const user = await this.userRepository.findOne({
				where: { id: accessData?.userId },
			})

			if (!user) {
				resultComments = comments.map(comment => ({
					...comment,
					author: comment.author.returnUser(),
					countLike: comment.likeUsers.length,
					countDisLike: comment.disLikeUsers.length,
				}))
			} else {
				resultComments = comments.map(comment => ({
					...comment,
					author: comment.author.returnUser(),
					countLike: comment.likeUsers.length,
					countDisLike: comment.disLikeUsers.length,
					isLike: comment.likeUsers.some(u => u.id === user.id),
					isDisLike: comment.disLikeUsers.some(u => u.id === user.id),
				}))
			}
		} else {
			resultComments = comments.map(comment => ({
				...comment,
				author: comment.author.returnUser(),
				countLike: comment.likeUsers.length,
				countDisLike: comment.disLikeUsers.length,
			}))
		}

		resultComments.forEach(c => {
			delete c.likeUsers
			delete c.disLikeUsers
		})

		return {
			comments: resultComments,
		}
	}

	async toggleLikeComment(id: string, userId: string) {
		const comment = await this.commentRepository.findOne({
			where: { id },
			relations: returnRelationComment,
		})
		if (!comment) throw new NotFoundException('Комментарий не найден')

		const user = await this.userRepository.findOne({ where: { id: userId } })
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (comment.likeUsers.some(user => user.id === userId)) {
			comment.likeUsers = comment.likeUsers.filter(user => user.id !== userId)
		} else {
			comment.likeUsers = [...comment.likeUsers, user]

			if (comment.disLikeUsers.some(user => user.id === userId)) {
				comment.disLikeUsers = comment.disLikeUsers.filter(
					user => user.id !== userId
				)
			}
		}

		await this.commentRepository.save(comment)

		return {
			comment: {
				...comment,
				author: comment.author.returnUser(),
				disLikeUsers: comment.disLikeUsers.map(user => user.returnUser()),
				likeUsers: comment.likeUsers.map(user => user.returnUser()),
			},
		}
	}

	async toggleDisLikeComment(id: string, userId: string) {
		const comment = await this.commentRepository.findOne({
			where: { id },
			relations: returnRelationComment,
		})
		if (!comment) throw new NotFoundException('Комментарий не найден')

		const user = await this.userRepository.findOne({ where: { id: userId } })
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (comment.disLikeUsers.some(user => user.id === userId)) {
			comment.disLikeUsers = comment.disLikeUsers.filter(
				user => user.id !== userId
			)
		} else {
			comment.disLikeUsers = [...comment.disLikeUsers, user]

			if (comment.likeUsers.some(user => user.id === userId)) {
				comment.likeUsers = comment.likeUsers.filter(user => user.id !== userId)
			}
		}

		await this.commentRepository.save(comment)

		return {
			comment: {
				...comment,
				author: comment.author.returnUser(),
				disLikeUsers: comment.disLikeUsers.map(user => user.returnUser()),
				likeUsers: comment.likeUsers.map(user => user.returnUser()),
			},
		}
	}
}
