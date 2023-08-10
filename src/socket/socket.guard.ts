// import { AuthGuard } from '@nestjs/passport'

// export class CheckAuthGuard extends AuthGuard('jwt') {}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { WsException } from '@nestjs/websockets'
import { Request } from 'express'

@Injectable()
export class CheckAuthSocketGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()

		const token = this.extractTokenFromHeader(request)

		if (!token) {
			throw new WsException('Вы не авторизованы')
		}
		try {
			const payload = await this.jwtService.verifyAsync(token)

			console.log(payload)

			request['user'] = {
				id: payload.userId,
			}
		} catch {
			throw new WsException('Вы не авторизованы')
		}
		return true
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const [type, token] =
			request.handshake.headers?.authorization?.split(' ') ?? []
		return type === 'Bearer' ? token : undefined
	}
}
