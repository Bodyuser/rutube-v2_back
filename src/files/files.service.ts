import {
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { path } from 'app-root-path'
import { ensureDir, writeFile, remove } from 'fs-extra'
import { SocketGateway } from 'src/socket/socket.gateway'
import { createVideo } from 'src/utils/createVideo'
import { getVideoInfo } from 'src/utils/getVideoInfo'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { ILike, Repository } from 'typeorm'
import { v4 } from 'uuid'
import { exists } from 'fs-extra'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class FilesService {
	constructor(
		private socketGateway: SocketGateway,
		@InjectRepository(VideoEntity)
		private videoRepository: Repository<VideoEntity>,
		private jwtService: JwtService
	) {}

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

	async uploadVideo(file: Express.Multer.File, folder: string, userId: string) {
		const uploadFolder = `${path}/uploads/${folder}`
		await ensureDir(uploadFolder)

		const uuid = v4()

		const rs = file.originalname.split('.')[1]
		await writeFile(`${uploadFolder}/${uuid}.${rs}`, file.buffer)

		const { duration, height, width } = await getVideoInfo(
			`${uploadFolder}/${uuid}.${rs}`
		)

		const onlineUsers = this.socketGateway.getOnlineUsers()

		console.log(onlineUsers)

		const id = onlineUsers.find(user => user.id === userId)?.socketId

		console.log(id, userId)

		await createVideo(
			`${uploadFolder}/${uuid}.${rs}`,
			`${uploadFolder}`,
			String(duration),
			String(height),
			String(width),
			this.socketGateway.server,
			id
		)

		await remove(`${uploadFolder}/${uuid}.${rs}`)

		return {
			url: `/uploads/${folder}/index.m3u8`,
		}
	}

	async getFile(
		filePath: string,
		res: any,
		accessToken?: string,
		refreshToken?: string
	) {
		if (!(await exists(path + filePath))) {
			throw new NotFoundException('Файл не найден')
		}

		if (filePath.split('/').length <= 4) {
			return res.sendFile(filePath, {
				root: path,
			})
		}

		const arr = filePath.split('/')
		arr.pop()
		const folder = arr.join('/')

		const video = await this.videoRepository.findOne({
			where: [
				{
					videoPath: ILike(`${folder}%`),
				},
				{
					bannerPath: ILike(`${folder}%`),
				},
			],
			relations: {
				author: true,
			},
		})

		if (!video) {
			return res.sendFile(filePath, {
				root: path,
			})
		}

		if (video.isPrivate) {
			if (!accessToken || !refreshToken) {
				throw new ForbiddenException('К сожалению файл приватный')
			}
			const accessPayload = await this.jwtService.verifyAsync(accessToken)

			if (video.author.id !== accessPayload?.userId) {
				throw new ForbiddenException('К сожалению файл приватный')
			}

			const refreshPayload = await this.jwtService.verifyAsync(refreshToken)

			if (video.author.id !== refreshPayload?.userId) {
				throw new ForbiddenException('К сожалению файл приватный')
			}

			return res.sendFile(filePath, {
				root: path,
			})
		}

		return res.sendFile(filePath, {
			root: path,
		})
	}
}
