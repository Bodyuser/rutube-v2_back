import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationEntity } from './entities/notification.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { CommentEntity } from 'src/comments/entities/comment.entity'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { connectJWT } from 'src/configs/connectJWT.config'

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
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectJWT,
		}),
	],
	exports: [NotificationsService],
})
export class NotificationsModule {}
