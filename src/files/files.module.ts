import { Module } from '@nestjs/common'
import { FilesService } from './files.service'
import { FilesController } from './files.controller'
import { ServeStaticModule } from '@nestjs/serve-static'
import { path } from 'app-root-path'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { connectJWT } from 'src/configs/connectJWT.config'
import { SocketModule } from 'src/socket/socket.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VideoEntity } from 'src/videos/entities/video.entity'

@Module({
	controllers: [FilesController],
	providers: [FilesService],
	imports: [
		// ServeStaticModule.forRoot({
		// 	rootPath: `${path}/uploads`,
		// 	serveRoot: '/uploads',
		// }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectJWT,
		}),
		SocketModule,
		TypeOrmModule.forFeature([VideoEntity]),
	],
})
export class FilesModule {}
