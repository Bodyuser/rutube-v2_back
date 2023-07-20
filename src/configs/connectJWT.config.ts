import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'

export const connectJWT = async (
	configService: ConfigService
): Promise<JwtModuleOptions> => ({
	secret: await configService.get('JWT_SECRET'),
})
