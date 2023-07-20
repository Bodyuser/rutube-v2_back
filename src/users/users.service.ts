import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'
import { Repository } from 'typeorm'
import { SendMailService } from 'src/send-mail/send-mail.service'
import { generateCode } from 'src/utils/generateCode'
import { compare } from 'bcryptjs'
import { getAgeFromBirth } from 'src/utils/getAgeFromBirth'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { returnRelationsUser } from './returnRelationsUser'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private sendMailService: SendMailService
	) {}

	async updateProfile(updateProfileDto: UpdateProfileDto, id: string) {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: returnRelationsUser,
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (updateProfileDto.email) {
			if (!updateProfileDto.code) {
				await this.sendMailService.sendMailForConfirmCode(user.email, user.code)
				throw new BadRequestException(
					'Вам на почту было отправлено письмо с интструкцией, как поменять почту'
				)
			}
			if (user.code !== updateProfileDto.code) {
				throw new BadRequestException('Данный код неверный')
			}

			user.email = updateProfileDto.email
			user.code = generateCode(6)
			await this.sendMailService.sendMailForActivateUser(
				user.email,
				user.activateLink
			)
		}

		if (updateProfileDto.password && updateProfileDto.currentPassword) {
			const isValidPassword = await compare(
				updateProfileDto.currentPassword,
				user.password
			)
			if (!isValidPassword)
				throw new BadRequestException('Текущий пароль неверный')

			user.password = updateProfileDto.password
		}

		if (user.name !== updateProfileDto.name) {
			const existName = await this.userRepository.findOne({
				where: { name: updateProfileDto.name },
			})
			if (existName) throw new BadRequestException('Имя занято')

			user.name = updateProfileDto.name
		}
		if (updateProfileDto.country) {
			user.country = updateProfileDto.country
		}
		user.avatarPath = updateProfileDto.avatarPath
		user.bannerPath = updateProfileDto.bannerPath
		if (updateProfileDto.about) {
			user.about = updateProfileDto.about
		}
		if (updateProfileDto.gender) {
			user.gender =
				updateProfileDto.gender === 'male'
					? 'male'
					: updateProfileDto.gender === 'female'
					? 'female'
					: user.gender
		}

		if (
			updateProfileDto.dateOfBirth &&
			user.dateOfBirth !== updateProfileDto.dateOfBirth
		) {
			user.age = getAgeFromBirth(updateProfileDto.dateOfBirth)
			user.dateOfBirth = updateProfileDto.dateOfBirth
		}

		await this.userRepository.save(user)

		return {
			user: {
				...user.returnProfile(),
			},
		}
	}

	async getProfile(id: string) {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: returnRelationsUser,
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		return {
			user: {
				...user.returnProfile(),
			},
		}
	}

	async deleteProfile(id: string) {
		const user = await this.userRepository.findOne({ where: { id } })
		if (!user) throw new NotFoundException('Пользователь не найден')

		await this.userRepository.delete(id)

		return {
			message: 'Пользователь удален',
		}
	}

	async activateProfile(activateLink: string, id: string) {
		const user = await this.userRepository.findOne({
			where: { activateLink, id },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (user.isActivated) {
			throw new BadRequestException('Аккаунт уже активирован')
		}

		user.isActivated = true

		await this.userRepository.save(user)

		return {
			message: 'Аккаунт активирован',
		}
	}

	async checkActivateLink(activateLink: string, id: string) {
		const user = await this.userRepository.findOne({
			where: { activateLink, id },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (user.isActivated) {
			throw new BadRequestException('Аккаунт уже активирован')
		}

		return {
			message: 'Аккаунт активирован',
		}
	}

	async followingUnFollowing(id: string, userId: string) {
		const profile = await this.userRepository.findOne({
			where: { id },
			relations: returnRelationsUser,
		})
		if (!profile) throw new NotFoundException('Пользователь не найден')

		const user = await this.userRepository.findOne({ where: { id: userId } })
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (profile.following.some(user => user.id === userId)) {
			profile.following = profile.following.filter(user => user.id !== userId)
		} else {
			profile.following = [...profile.following, user]
		}

		await this.userRepository.save(profile)

		return {
			message: profile.following.some(user => user.id === userId)
				? 'Вы подписались'
				: 'Вы отписались',
		}
	}

	async getFollowing(id: string) {
		const users = await this.userRepository.find({
			where: {
				followers: {
					id,
				},
			},
			relations: returnRelationsUser,
		})

		return {
			users: users.map(user => user.returnUser()),
		}
	}

	async getUser(name: string) {
		const user = await this.userRepository.findOne({
			where: { name },
			relations: returnRelationsUser,
		})

		return {
			user: {
				...user.returnUser(),
			},
		}
	}
}
