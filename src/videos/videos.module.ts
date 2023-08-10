import { Module } from '@nestjs/common'
import { VideosService } from './videos.service'
import { VideosController } from './videos.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VideoEntity } from './entities/video.entity'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { NotificationsModule } from 'src/notifications/notifications.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { connectJWT } from 'src/configs/connectJWT.config'

@Module({
	controllers: [VideosController],
	providers: [VideosService],
	imports: [
		TypeOrmModule.forFeature([VideoEntity, CategoryEntity, UserEntity]),
		NotificationsModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectJWT,
		}),
	],
})
export class VideosModule {}
