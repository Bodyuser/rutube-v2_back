import { Injectable, NotFoundException } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from 'src/users/entities/user.entity'
import { SendMailDto } from './dto/send-mail.dto'
import { TypeAuthEnum } from 'src/users/enums/type-auth.enum'

@Injectable()
export class SendMailService {
	constructor(
		private mailerService: MailerService,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
	) {}

	async sendMailForActivateUser(email: string, link: string) {
		return await this.mailerService.sendMail({
			to: email,
			from: process.env.MAILER_EMAIL,
			subject: 'Активация профиля',
			html: `Вам на почту пришло письмо, чтобы активировать свой профиль<br>Нажмите на ссылку, чтобы подтвердить<br>
            <a href='${process.env.APP_URL}/profile/activate/${link}'>Активировать аккаунт</a>
            `,
		})
	}

	async sendMailForResetPassword(sendMailDto: SendMailDto) {
		const user = await this.userRepository.findOne({
			where: { email: sendMailDto.email, typeAuth: TypeAuthEnum.DEFAULT },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		return await this.mailerService.sendMail({
			to: sendMailDto.email,
			from: process.env.EMAIL,
			subject: 'Сброс пароля',
			html: `Вы получили письмо на почту, чтобы сбросить пароль от аккаунта<br><br>
            <a href='${process.env.APP_URL}/auth/reset/${user.resetLink}'>Сбросить пароль</a>
            `,
		})
	}

	async sendMailForConfirmCode(email: string, code: number) {
		return await this.mailerService.sendMail({
			to: email,
			from: process.env.EMAIL,
			subject: 'Подтвердить изменение почты',
			html: `Вы получили письмо на почту, чтобы подтвердить изменение почты<br><br>
           Ваш код: <b>${code}</b>
            `,
		})
	}
}
