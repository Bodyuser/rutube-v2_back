import { Injectable, NotFoundException } from '@nestjs/common'
import { NotificationEntity } from './entities/notification.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { returnRelationNotification } from './returnRelationNotification'
import { UserEntity } from 'src/users/entities/user.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { CommentEntity } from 'src/comments/entities/comment.entity'

@Injectable()
export class NotificationsService {
	constructor(
		@InjectRepository(NotificationEntity)
		private notificationRepository: Repository<NotificationEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(VideoEntity)
		private videoRepository: Repository<VideoEntity>,
		@InjectRepository(CommentEntity)
		private commentRepository: Repository<CommentEntity>
	) {}

	async readAllNotifications(userId: string) {
		const notifications = await this.notificationRepository.find({
			where: {
				user: {
					id: userId,
				},
			},
			relations: returnRelationNotification,
		})

		notifications.map(notification => (notification.read = true))

		await this.notificationRepository.save(notifications)

		return {
			notifications: notifications.map(notification => ({
				...notification,
				user: notification.user.returnUser(),
			})),
		}
	}

	async getNotificationsByProfile(userId: string) {
		const notifications = await this.notificationRepository.find({
			where: {
				user: {
					id: userId,
				},
			},
			relations: returnRelationNotification,
			order: {
				createdAt: 'DESC',
			},
		})

		return {
			notifications: notifications.map(notification => ({
				...notification,
				user: notification.user.returnUser(),
			})),
		}
	}

	async createNotification(
		text: string,
		type:
			| 'reply-to-comment'
			| 'upload-video'
			| 'comment-to-video'
			| 'strange-entrance',
		url: string,
		id: string,
		commentId?: string,
		videoId?: string
	) {
		const user = await this.userRepository.findOne({
			where: {
				id,
			},
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		let comment: CommentEntity = {} as CommentEntity
		let video: VideoEntity = {} as VideoEntity

		if (videoId) {
			video = await this.videoRepository.findOne({
				where: {
					id: videoId,
				},
			})
		}

		if (commentId) {
			comment = await this.commentRepository.findOne({
				where: {
					id: commentId,
				},
			})
		}		

		const notification = this.notificationRepository.create({
			text,
			type,
			url,
			user,
			video: video?.id ? video : null,
			comment: comment?.id ? comment : null,
		})

		await this.notificationRepository.save(notification)

		return {
			notification: {
				...notification,
				user: notification.user.returnProfile(),
			},
		}
	}
}
