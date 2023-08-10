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
import { v4, validate } from 'uuid'
import { VideoEntity } from 'src/videos/entities/video.entity'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private sendMailService: SendMailService,
		@InjectRepository(VideoEntity)
		private videoRepository: Repository<VideoEntity>
	) {}

	async updateProfile(updateProfileDto: UpdateProfileDto, id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const user = await this.userRepository.findOne({
			where: { id },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		let updatedFields = {}

		if (updateProfileDto.email && user.email !== updateProfileDto.email) {
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
			updatedFields['email'] = updateProfileDto.email
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
			updatedFields['name'] = updateProfileDto.name
		}
		if (updateProfileDto.country && user.country !== updateProfileDto.country) {
			user.country = updateProfileDto.country
			updatedFields['country'] = updateProfileDto.country
		}

		if (updateProfileDto.about && user.about !== updateProfileDto.about) {
			user.about = updateProfileDto.about
			updatedFields['about'] = updateProfileDto.about
		}
		if (updateProfileDto.gender && user.gender !== updateProfileDto.gender) {
			user.gender =
				updateProfileDto.gender === 'male'
					? 'male'
					: updateProfileDto.gender === 'female'
					? 'female'
					: user.gender

			updatedFields['gender'] = updateProfileDto.gender
		}

		if (
			updateProfileDto.dateOfBirth &&
			user.dateOfBirth !== updateProfileDto.dateOfBirth
		) {
			user.age = getAgeFromBirth(updateProfileDto.dateOfBirth)
			user.dateOfBirth = updateProfileDto.dateOfBirth
			updatedFields['dateOfBirth'] = updateProfileDto.dateOfBirth
		}

		await this.userRepository.save(user)

		return {
			user: updatedFields,
		}
	}

	async updateAvatarPath(avatarPath: string, id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const user = await this.userRepository.findOne({
			where: { id },
			relations: returnRelationsUser,
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		user.avatarPath = avatarPath

		await this.userRepository.save(user)

		return {
			avatarPath,
		}
	}

	async updateBannerPath(bannerPath: string, id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const user = await this.userRepository.findOne({
			where: { id },
			relations: returnRelationsUser,
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		user.bannerPath = bannerPath

		await this.userRepository.save(user)

		return {
			bannerPath,
		}
	}

	async getProfile(id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const user = await this.userRepository.findOne({
			where: { id },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		return {
			user: user.returnProfile(),
		}
	}

	async getStatistics(id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const user = await this.userRepository.findOne({
			where: { id },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		const videosCount = await this.videoRepository.findAndCount({
			where: { author: { id } },
			relations: { author: true },
		})
		const followersCount = await this.userRepository.findAndCount({
			where: { following: { id } },
			relations: { following: true },
		})
		const followingCount = await this.userRepository.findAndCount({
			where: { followers: { id } },
			relations: { followers: true },
		})

		return {
			videosCount: videosCount[1],
			followersCount: followersCount[1],
			followingCount: followingCount[1],
		}
	}

	async deleteProfile(id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const user = await this.userRepository.findOne({ where: { id } })
		if (!user) throw new NotFoundException('Пользователь не найден')

		await this.userRepository.delete(id)

		return {
			message: 'Пользователь удален',
		}
	}

	async activateProfile(activateLink: string, id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const isValidLink = validate(activateLink)
		if (!isValidLink) throw new BadRequestException('Неверный формат ссылки')

		const user = await this.userRepository.findOne({
			where: { activateLink, id },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (user.isActivated) {
			throw new BadRequestException('Аккаунт уже активирован')
		}

		user.isActivated = true

		user.activateLink = v4()

		await this.userRepository.save(user)

		return {
			message: 'Аккаунт активирован',
		}
	}

	async checkActivateLink(activateLink: string, id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const isValidLink = validate(activateLink)
		if (!isValidLink) throw new BadRequestException('Неверный формат ссылки')

		const user = await this.userRepository.findOne({
			where: { activateLink, id },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (user.isActivated) {
			throw new BadRequestException('Аккаунт уже активирован')
		}

		return {
			message: 'Аккаунт можно активировать',
		}
	}

	async followingUnFollowing(id: string, userId: string) {
		if (id === userId) {
			throw new BadRequestException('На себя нельзя подписаться')
		}

		const isValidId = validate(id)
		if (!isValidId) throw new BadRequestException('Неверный формат id')

		const isValidUserId = validate(userId)
		if (!isValidUserId) throw new BadRequestException('Неверный формат id')

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
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const users = await this.userRepository.find({
			where: {
				followers: {
					id,
				},
			},
			relations: {
				followers: true,
			},
		})

		let resultUsers = []

		if (users?.length) {
			resultUsers = users.map(user => ({
				...user,
				isSubscribe: true,
				countFollowers: user.followers?.length,
			}))

			resultUsers.forEach(user => {
				delete user.followers
			})
		}

		return {
			users: resultUsers,
		}
	}

	async getUser(name: string) {
		const user = await this.userRepository.findOne({
			where: { name },
		})

		return {
			user: user.returnUser(),
		}
	}
}
