import { Injectable, NotFoundException } from '@nestjs/common'
import { NotificationEntity } from './entities/notification.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { returnRelationNotification } from './returnRelationNotification'
import { UserEntity } from 'src/users/entities/user.entity'

@Injectable()
export class NotificationsService {
	constructor(
		@InjectRepository(NotificationEntity)
		private notificationRepository: Repository<NotificationEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>
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
		id: string
	) {
		const user = await this.userRepository.findOne({
			where: {
				id,
			},
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		const notification = this.notificationRepository.create({
			text,
			type,
			url,
			user,
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
