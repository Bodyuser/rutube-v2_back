import { Module } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/entities/user.entity'
import { CommentEntity } from './entities/comment.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { NotificationsModule } from 'src/notifications/notifications.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { connectJWT } from 'src/configs/connectJWT.config'

@Module({
	controllers: [CommentsController],
	providers: [CommentsService],
	imports: [
		TypeOrmModule.forFeature([UserEntity, CommentEntity, VideoEntity]),
		NotificationsModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectJWT,
		}),
	],
})
export class CommentsModule {}
