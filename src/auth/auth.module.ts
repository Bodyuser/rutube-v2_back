import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from 'src/strategies/jwt.strategy'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { connectJWT } from 'src/configs/connectJWT.config'
import { UserEntity } from 'src/users/entities/user.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SendMailModule } from 'src/send-mail/send-mail.module'
import { IpEntity } from 'src/ip.entity'

@Module({
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	imports: [
		TypeOrmModule.forFeature([UserEntity, IpEntity]),
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectJWT,
		}),
		SendMailModule,
	],
})
export class AuthModule {}
