import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { UserEntity } from 'src/users/entities/user.entity'
import { convertRoleToNumber } from 'src/utils/convertRoleToNumber'

@Injectable()
export class CheckRoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}
	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest<{ user: UserEntity }>()
		const user = request.user

		const role = this.reflector.getAllAndOverride<number>('role', [
			context.getHandler(),
			context.getClass(),
		])

		const userRole = convertRoleToNumber(user.role)

		if (userRole >= role) {
			return true
		}
		throw new ForbiddenException('Вы не имеете доступа')
	}
}
