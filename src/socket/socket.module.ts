import { Module } from '@nestjs/common'
import { SocketService } from './socket.service'
import { SocketGateway } from './socket.gateway'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/entities/user.entity'
import { IpEntity } from 'src/ip.entity'
import { NotificationsModule } from 'src/notifications/notifications.module'

@Module({
	providers: [SocketGateway, SocketService],
	imports: [
		TypeOrmModule.forFeature([UserEntity, IpEntity]),
		NotificationsModule,
	],
	exports: [SocketGateway],
})
export class SocketModule {}
