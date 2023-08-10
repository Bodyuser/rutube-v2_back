import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Put,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { User } from './decorators/user.decorator'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdateAvatarPathDto } from './dto/update-avatar-path.dto'
import { UpdateBannerPathDto } from './dto/update-banner-path.dto'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('profile')
	@Auth()
	async getProfile(@User('id') id: string) {
		return this.usersService.getProfile(id)
	}

	@Get('profile/statistics')
	@Auth()
	async getStatistics(@User('id') id: string) {
		return this.usersService.getStatistics(id)
	}

	@Auth()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	@Put('profile')
	async updateProfile(
		@User('id') id: string,
		@Body() updateProfileDto: UpdateProfileDto
	) {
		return this.usersService.updateProfile(updateProfileDto, id)
	}

	@Auth()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	@Patch('profile/banner')
	async updateBannerPath(
		@User('id') id: string,
		@Body() updateBannerPathDto: UpdateBannerPathDto
	) {
		return this.usersService.updateBannerPath(
			updateBannerPathDto.bannerPath,
			id
		)
	}

	@Auth()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	@Patch('profile/avatar')
	async updateAvatarPath(
		@User('id') id: string,
		@Body() updateAvatarPathDto: UpdateAvatarPathDto
	) {
		return this.usersService.updateAvatarPath(
			updateAvatarPathDto.avatarPath,
			id
		)
	}

	@Auth()
	@HttpCode(200)
	@Delete('profile')
	async deleteProfile(@User('id') id: string) {
		return this.usersService.deleteProfile(id)
	}

	@Auth()
	@Get('check-activate-link/:activateLink')
	async checkActivateLink(
		@Param('activateLink') activateLink: string,
		@User('id') id: string
	) {
		return await this.usersService.checkActivateLink(activateLink, id)
	}

	@Auth()
	@Patch('activate-profile/:activateLink')
	async activateProfile(
		@Param('activateLink') activateLink: string,
		@User('id') id: string
	) {
		return await this.usersService.activateProfile(activateLink, id)
	}

	@Auth()
	@Patch('/follow-un-follow/:userId')
	async followingUnFollowing(
		@User('id') id: string,
		@Param('userId') userId: string
	) {
		return await this.usersService.followingUnFollowing(id, userId)
	}

	@Auth()
	@Get('following')
	async getFollowing(@User('id') id: string) {
		return await this.usersService.getFollowing(id)
	}

	@Get(':name')
	async getUser(@Param('name') name: string) {
		return await this.usersService.getUser(name)
	}
}
