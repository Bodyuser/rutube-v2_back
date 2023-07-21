import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationEntity } from './entities/notification.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { CommentEntity } from 'src/comments/entities/comment.entity'

@Module({
	controllers: [NotificationsController],
	providers: [NotificationsService],
	imports: [
		TypeOrmModule.forFeature([
			NotificationEntity,
			UserEntity,
			VideoEntity,
			CommentEntity,
		]),
	],
	exports: [NotificationsService],
})
export class NotificationsModule {}
