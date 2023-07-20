import { Injectable } from '@nestjs/common'
import { path } from 'app-root-path'
import { ensureDir, writeFile } from 'fs-extra'
import { v4 } from 'uuid'

@Injectable()
export class FilesService {
	async uploadImage(file: Express.Multer.File, folder: string) {
		const uploadFolder = `${path}/uploads/${folder}`
		await ensureDir(uploadFolder)

		const uuid = v4()

		const rs = file.originalname.split('.')[1]
		await writeFile(`${uploadFolder}/${uuid}.${rs}`, file.buffer)
		return {
			url: `/uploads/${folder}/${uuid}.${rs}`,
		}
	}

	async uploadVideo(file: Express.Multer.File, folder: string) {
		const uploadFolder = `${path}/uploads/${folder}`
		await ensureDir(uploadFolder)

		const uuid = v4()

		const rs = file.originalname.split('.')[1]
		await writeFile(`${uploadFolder}/${uuid}.${rs}`, file.buffer)
		return {
			url: `/uploads/${folder}/${uuid}.${rs}`,
		}
	}
}
