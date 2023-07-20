import { Controller, Get, Patch } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { User } from 'src/users/decorators/user.decorator'

@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Patch('read')
	@Auth()
	async readAllNotifications(@User('id') id: string) {
		return await this.notificationsService.readAllNotifications(id)
	}

	@Get('')
	@Auth()
	async getNotificationsByProfile(@User('id') id: string) {
		return await this.notificationsService.getNotificationsByProfile(id)
	}
}
