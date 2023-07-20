import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SendMailController } from './send-mail.controller'
import { SendMailService } from './send-mail.service'
import { UserEntity } from 'src/users/entities/user.entity'

@Module({
	controllers: [SendMailController],
	providers: [SendMailService],
	exports: [SendMailService],
	imports: [TypeOrmModule.forFeature([UserEntity])],
})
export class SendMailModule {}
