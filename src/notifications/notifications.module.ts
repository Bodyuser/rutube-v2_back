import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationEntity } from './entities/notification.entity'
import { UserEntity } from 'src/users/entities/user.entity'

@Module({
	controllers: [NotificationsController],
	providers: [NotificationsService],
	imports: [TypeOrmModule.forFeature([NotificationEntity, UserEntity])],
	exports: [NotificationsService],
})
export class NotificationsModule {}
