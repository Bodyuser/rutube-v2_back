import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CheckAuthGuard } from 'src/guards/check-auth.guard'
import { CheckRoleGuard } from 'src/guards/check-role.guard'
import { UserRoleEnum } from 'src/users/enums/user-role.enum'

import { convertRoleToNumber } from 'src/utils/ConvertRoleToNumber'

export const Auth = (role: UserRoleEnum = UserRoleEnum.USER) => {
	const numRole = convertRoleToNumber(role)
	if (numRole === 1) {
		return applyDecorators(UseGuards(CheckAuthGuard))
	} else if (numRole >= 2) {
		return applyDecorators(
			SetMetadata('role', numRole),
			UseGuards(CheckAuthGuard, new CheckRoleGuard(new Reflector()))
		)
	}
}
