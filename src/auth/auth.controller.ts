import {
	Controller,
	Post,
	Body,
	UsePipes,
	ValidationPipe,
	HttpCode,
	Get,
	Res,
	Req,
	Patch,
	Param,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { Request, Response } from 'express'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { TokenPayload } from 'google-auth-library'
import { FacebookDto } from './dto/facebook.dto'
import axios from 'axios'

const cookieData = {
	path: '/api',
	httpOnly: true,
	maxAge: 1000 * 60 * 60 * 24 * 15,
}

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) response: Response
	) {
		const result = await this.authService.login(loginDto)

		response.cookie('refreshToken', result.tokens.refreshToken, cookieData)

		return {
			user: result.user,
			token: result.tokens.accessToken,
		}
	}

	@Post('register')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async register(
		@Body() registerDto: RegisterDto,
		@Res({ passthrough: true }) response: Response
	) {
		const result = await this.authService.register(registerDto)

		response.cookie('refreshToken', result.tokens.refreshToken, cookieData)

		return {
			user: result.user,
			token: result.tokens.accessToken,
		}
	}

	@Get('logout')
	async logout(@Res({ passthrough: true }) response: Response) {
		response.clearCookie('refreshToken', cookieData)

		return {
			message: 'You successfully logged out',
		}
	}

	@Get('new-token')
	async getNewToken(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	) {
		const result = await this.authService.getNewToken(
			request.cookies.refreshToken
		)

		response.cookie('refreshToken', result.tokens.refreshToken, cookieData)

		return {
			user: result.user,
			token: result.tokens.accessToken,
		}
	}

	@Patch('reset-password/:resetLink')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async resetPassword(
		@Body() resetPasswordDto: ResetPasswordDto,
		@Param('resetLink') resetLink: string
	) {
		return await this.authService.resetPassword(resetLink, resetPasswordDto)
	}

	@Get('check-reset-link/:resetLink')
	async checkResetLink(@Param('resetLink') resetLink: string) {
		return await this.authService.checkResetLink(resetLink)
	}

	@Post('google')
	async authByGoogle(
		@Body('token') token: string,
		@Res({ passthrough: true }) response: Response
	) {
		let data = {}

		await axios
			.get(
				`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
			)
			.then(response => (data = response.data))

		const result = await this.authService.authByGoogle(data as TokenPayload)

		response.cookie('refreshToken', result.tokens.refreshToken, cookieData)

		return {
			user: result.user,
			token: result.tokens.accessToken,
		}
	}

	@Post('facebook')
	async authByFacebook(
		@Body() facebookDto: FacebookDto,
		@Res({ passthrough: true }) response: Response
	) {
		const result = await this.authService.authByFacebook(facebookDto)

		response.cookie('refreshToken', result.tokens.refreshToken, cookieData)

		return {
			user: result.user,
			token: result.tokens.accessToken,
		}
	}
}
