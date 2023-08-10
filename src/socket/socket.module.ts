import { Module } from '@nestjs/common'
import { SocketService } from './socket.service'
import { SocketGateway } from './socket.gateway'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/entities/user.entity'
import { IpEntity } from 'src/ip.entity'
import { NotificationsModule } from 'src/notifications/notifications.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { connectJWT } from 'src/configs/connectJWT.config'

@Module({
	providers: [SocketGateway, SocketService],
	imports: [
		TypeOrmModule.forFeature([UserEntity, IpEntity]),
		NotificationsModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectJWT,
		}),
	],
	exports: [SocketGateway],
})
export class SocketModule {}
