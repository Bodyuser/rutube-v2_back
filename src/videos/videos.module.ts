import { Module } from '@nestjs/common'
import { VideosService } from './videos.service'
import { VideosController } from './videos.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VideoEntity } from './entities/video.entity'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { NotificationsModule } from 'src/notifications/notifications.module'

@Module({
	controllers: [VideosController],
	providers: [VideosService],
	imports: [
		TypeOrmModule.forFeature([VideoEntity, CategoryEntity, UserEntity]),
		NotificationsModule,
	],
})
export class VideosModule {}
