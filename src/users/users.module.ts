import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'
import { SendMailModule } from 'src/send-mail/send-mail.module'

@Module({
	controllers: [UsersController],
	providers: [UsersService],
	imports: [TypeOrmModule.forFeature([UserEntity]), SendMailModule],
})
export class UsersModule {}
