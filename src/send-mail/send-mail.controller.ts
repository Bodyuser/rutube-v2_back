import {
	Body,
	Controller,
	HttpCode,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { SendMailService } from './send-mail.service'
import { SendMailDto } from './dto/send-mail.dto'

@Controller('send-mail')
export class SendMailController {
	constructor(private readonly sendMailService: SendMailService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('reset')
	async sendMailForResetPassword(@Body() sendMailDto: SendMailDto) {
		await this.sendMailService.sendMailForResetPassword(sendMailDto)
		return {
			message:
				'Instructions on how to reset your password have been sent to this email.',
		}
	}
}
