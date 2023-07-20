import { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

export const connectNodemailer = async (
	configService: ConfigService
): Promise<MailerOptions> => ({
	transport: {
		host: await configService.get('MAILER_HOST'),
		auth: {
			user: await configService.get('MAILER_EMAIL'),
			pass: await configService.get('MAILER_PASS'),
		},
	},
})
