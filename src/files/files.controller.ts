import {
	Controller,
	FileTypeValidator,
	Get,
	HttpCode,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	Post,
	Query,
	UploadedFile,
	Res,
	UseInterceptors,
	Req,
} from '@nestjs/common'
import { FilesService } from './files.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FileInterceptor } from '@nestjs/platform-express'
import { User } from 'src/users/decorators/user.decorator'
import { Request, Response } from 'express'

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post('image')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('image'))
	@Auth()
	async uploadImage(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 10485760 }),
					new FileTypeValidator({ fileType: /^image*/i }),
				],
			})
		)
		file: Express.Multer.File,
		@Query('folder') folder: string
	) {
		return this.filesService.uploadImage(file, folder)
	}

	@Post('video')
	@HttpCode(200)
	@Auth()
	@UseInterceptors(FileInterceptor('video'))
	async uploadVideo(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 104857600 }),
					new FileTypeValidator({ fileType: /^video*/i }),
				],
			})
		)
		file: Express.Multer.File,
		@Query('folder') folder: string,
		@User('id') id: string
	) {
		return this.filesService.uploadVideo(file, folder, id)
	}

	@Get('*')
	async getFile(
		@Param() fullPath: any,
		@Res() res: Response,
		@Req() req: Request
	) {
		const filePath = fullPath['0']

		const accessToken =
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
				? req.headers.authorization.split(' ')[1]
				: undefined

		return await this.filesService.getFile(
			`/${filePath}`,
			res,
			accessToken,
			req.cookies.refreshToken
		)
	}
}
