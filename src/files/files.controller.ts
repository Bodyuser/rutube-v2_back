import {
	Controller,
	FileTypeValidator,
	HttpCode,
	MaxFileSizeValidator,
	ParseFilePipe,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FilesService } from './files.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FileInterceptor } from '@nestjs/platform-express'

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
		@Query('folder') folder: string
	) {
		return this.filesService.uploadImage(file, folder)
	}
}
