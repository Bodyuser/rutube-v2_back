import { Module } from '@nestjs/common'
import { SearchService } from './search.service'
import { SearchController } from './search.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { connectJWT } from 'src/configs/connectJWT.config'

@Module({
	controllers: [SearchController],
	providers: [SearchService],
	imports: [
		TypeOrmModule.forFeature([VideoEntity, UserEntity]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectJWT,
		}),
	],
})
export class SearchModule {}
