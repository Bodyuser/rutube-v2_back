import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)
	app.setGlobalPrefix('api')
	app.enableCors({
		credentials: true,
		origin: process.env.APP_URL,
	})
	app.use(cookieParser())
	await app.listen(4200)
}
bootstrap()
