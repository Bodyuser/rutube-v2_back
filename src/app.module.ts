import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataSourceOptions } from './ormconfig'
import { IpEntity } from './ip.entity'
import { AuthModule } from './auth/auth.module'
import { SendMailModule } from './send-mail/send-mail.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { connectNodemailer } from './configs/connectNodemailer.config'
import { SocketModule } from './socket/socket.module'
import { CategoriesModule } from './categories/categories.module'
import { VideosModule } from './videos/videos.module'
import { CommentsModule } from './comments/comments.module'
import { NotificationsModule } from './notifications/notifications.module'
import { FilesModule } from './files/files.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		UsersModule,
		TypeOrmModule.forRoot(dataSourceOptions),
		TypeOrmModule.forFeature([IpEntity]),
		SendMailModule,
		AuthModule,
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectNodemailer,
		}),
		CategoriesModule,
		VideosModule,
		SocketModule,
		CommentsModule,
		NotificationsModule,
		FilesModule,
	],
})
export class AppModule {}
