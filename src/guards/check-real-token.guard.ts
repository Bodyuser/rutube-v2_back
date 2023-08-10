import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class CheckRealTokenGuard implements CanActivate {
	constructor(private reflector: Reflector, private jwtService: JwtService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request & { user: any } = context.switchToHttp().getRequest()
		const user = request.user

		const refreshToken = request.cookies.refreshToken

		if (!refreshToken) {
			throw new ForbiddenException('Вы не имеете доступа')
		}

		const data = await this.jwtService.verifyAsync(refreshToken)

		if (!data.userId) {
			throw new ForbiddenException('Вы не имеете доступа')
		}

		if (data.userId !== user.id) {
			throw new ForbiddenException('Неверный access token')
		}

		return true
	}
}
