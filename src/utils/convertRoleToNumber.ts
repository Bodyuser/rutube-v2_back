import { UserRoleEnum } from 'src/users/enums/user-role.enum'

export const convertRoleToNumber = (userRole: UserRoleEnum) => {
	return userRole === UserRoleEnum.OWNER
		? 3
		: userRole === UserRoleEnum.ADMIN
		? 2
		: userRole === UserRoleEnum.USER
		? 1
		: 0
}
