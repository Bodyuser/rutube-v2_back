import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from 'src/users/entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import { compare, genSalt, hash } from 'bcryptjs'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { v4, validate } from 'uuid'
import { TokenPayload } from 'google-auth-library'
import { FacebookDto } from './dto/facebook.dto'
import { SendMailService } from 'src/send-mail/send-mail.service'
import { TypeAuthEnum } from 'src/users/enums/type-auth.enum'
import { generateName } from 'src/utils/generateName'

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private jwtService: JwtService,
		private sendMailService: SendMailService
	) {}

	async login(loginDto: LoginDto) {
		const user = await this.validateUser(loginDto.email, loginDto.password)

		const tokens = await this.issueToken(user.id)

		return {
			user: user.returnProfile(),
			tokens,
		}
	}

	async register(registerDto: RegisterDto) {
		const user = await this.findByEmail(registerDto.email)
		if (user)
			throw new BadRequestException('Пользователь с такой почтой существует')

		const names = await this.userRepository.find({
			select: { name: true },
		})

		const newUser = this.userRepository.create({
			...registerDto,
			name: generateName(names.map(user => user.name)),
		})

		await this.userRepository.save(newUser)

		await this.sendMailService.sendMailForActivateUser(
			newUser.email,
			newUser.activateLink
		)

		const tokens = await this.issueToken(newUser.id)

		return {
			user: newUser.returnProfile(),
			tokens,
		}
	}

	async getNewToken(refreshToken: string) {
		if (!refreshToken) throw new UnauthorizedException('Вы не авторизованы')

		const payload = await this.jwtService.verifyAsync(refreshToken)
		if (!payload.userId) throw new UnauthorizedException('Неправильный токен')

		const user = await this.userRepository.findOne({
			where: { id: payload.userId },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		await this.userRepository.save(user)

		const tokens = await this.issueToken(user.id)

		return {
			user: user.returnProfile(),
			tokens,
		}
	}

	async resetPassword(resetLink: string, resetPasswordDto: ResetPasswordDto) {
		const isValid = validate(resetLink)
		if (!isValid) throw new BadRequestException('Неверный формат ссылки')

		const user = await this.userRepository.findOne({
			where: { resetLink, typeAuth: TypeAuthEnum.DEFAULT },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		const salt = await genSalt(10)
		user.password = await hash(resetPasswordDto.password, salt)

		user.resetLink = v4()

		await this.userRepository.save(user)

		return {
			message: 'Пароль успешно изменен',
		}
	}

	async checkResetLink(resetLink: string) {
		const isValid = validate(resetLink)
		if (!isValid) throw new BadRequestException('Неверный формат ссылки')
		const user = await this.userRepository.findOne({
			where: { resetLink, typeAuth: TypeAuthEnum.DEFAULT },
		})
		if (!user) throw new NotFoundException('Пользователь не найден')

		return {
			message: 'Вы можете поменять пароль',
		}
	}

	private async issueToken(id: string) {
		const payload = {
			userId: id,
		}

		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: '5m',
		})

		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: '15d',
		})

		return {
			accessToken,
			refreshToken,
		}
	}

	private async validateUser(email: string, password: string) {
		const user = await this.findByEmail(email)
		if (!user) throw new BadRequestException('Почта или пароль неправильны')

		const isValidPassword = await compare(password, user.password)
		if (!isValidPassword)
			throw new BadRequestException('Почта или пароль неправильны')

		return user
	}

	private async findByEmail(email: string) {
		return await this.userRepository.findOne({
			where: { email, typeAuth: TypeAuthEnum.DEFAULT },
		})
	}

	async authByGoogle(user: TokenPayload) {
		const existUser = await this.userRepository.findOne({
			where: {
				email: user.email,
				typeAuth: TypeAuthEnum.GOOGLE,
			},
		})

		if (existUser) {
			const tokens = await this.issueToken(existUser.id)

			return {
				user: existUser.returnProfile(),
				tokens,
			}
		}

		const names = await this.userRepository.find({
			select: { name: true },
		})

		const newUser = this.userRepository.create({
			avatarPath: user.picture,
			email: user.email,
			name: generateName(names.map(user => user.name)),
			password: null,
			isActivated: true,
			typeAuth: TypeAuthEnum.GOOGLE,
		})

		await this.userRepository.save(newUser)

		const tokens = await this.issueToken(newUser.id)

		return {
			user: newUser.returnProfile(),
			tokens,
		}
	}

	async authByFacebook(facebookDto: FacebookDto) {
		const existUser = await this.userRepository.findOne({
			where: {
				email: facebookDto.email,
				typeAuth: TypeAuthEnum.FACEBOOK,
			},
		})

		if (existUser) {
			const tokens = await this.issueToken(existUser.id)
			return {
				user: existUser.returnProfile(),
				tokens,
			}
		}

		const names = await this.userRepository.find({
			select: { name: true },
		})

		const newUser = this.userRepository.create({
			avatarPath: facebookDto.picture,
			email: facebookDto.email,
			name: generateName(names.map(user => user.name)),
			password: null,
			isActivated: true,
			typeAuth: TypeAuthEnum.FACEBOOK,
		})

		await this.userRepository.save(newUser)

		const tokens = await this.issueToken(newUser.id)

		return {
			user: newUser.returnProfile(),
			tokens,
		}
	}
}
