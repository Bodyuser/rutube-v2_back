import { Module } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/entities/user.entity'
import { CommentEntity } from './entities/comment.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { NotificationsModule } from 'src/notifications/notifications.module'

@Module({
	controllers: [CommentsController],
	providers: [CommentsService],
	imports: [
		TypeOrmModule.forFeature([UserEntity, CommentEntity, VideoEntity]),
		NotificationsModule,
	],
})
export class CommentsModule {}
