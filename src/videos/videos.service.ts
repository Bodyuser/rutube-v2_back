import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { VideoEntity } from './entities/video.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { In, MoreThan, MoreThanOrEqual, Not, Repository } from 'typeorm'
import { CreateVideoDto } from './dto/create-video.dto'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { UpdateVideoDto } from './dto/update-video.dto'
import { returnRelationVideo } from './returnRelationVideo'
import { NotificationsService } from 'src/notifications/notifications.service'
import { validate } from 'uuid'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class VideosService {
	constructor(
		@InjectRepository(VideoEntity)
		private videoRepository: Repository<VideoEntity>,
		@InjectRepository(CategoryEntity)
		private categoryRepository: Repository<CategoryEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private notificationsService: NotificationsService,
		private jwtService: JwtService
	) {}

	async createVideo(createVideoDto: CreateVideoDto, id: string) {
		const existSlug = await this.videoRepository.findOne({
			where: { slug: createVideoDto.slug },
		})
		if (existSlug) throw new BadRequestException('Слаг занят')

		const category = await this.categoryRepository.findOne({
			where: { slug: createVideoDto.category },
		})
		if (!category) throw new NotFoundException('Категория не найдена')

		const author = await this.userRepository.findOne({ where: { id } })
		if (!author) throw new NotFoundException('Пользователь не найден')

		const video = this.videoRepository.create({
			...createVideoDto,
			category,
			author,
		})

		await this.videoRepository.save(video)

		const users = await this.userRepository.find({
			where: {
				following: {
					id: author.id,
				},
			},
			relations: {
				following: true,
			},
		})

		Promise.all(
			users.map(async user => {
				await this.notificationsService.createNotification(
					`Пользователь ${author.name} выпустил новое видео: ${video.title}`,
					'upload-video',
					`/videos/${video.slug}`,
					user.id,
					null,
					video.id
				)
			})
		)

		const { author: a, category: c, ...rest } = video

		return {
			video: rest,
		}
	}

	async updateVideo(
		updateVideoDto: UpdateVideoDto,
		id: string,
		userId: string
	) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const isValidUserId = validate(userId)
		if (!isValidUserId) throw new BadRequestException('Неверный формат id')

		const video = await this.videoRepository.findOne({
			where: { id, author: { id: userId } },
			relations: {
				category: true,
			},
		})
		if (!video) throw new NotFoundException('Видео не найдено')

		if (video.slug !== updateVideoDto.slug) {
			const existSlug = await this.videoRepository.findOne({
				where: { slug: updateVideoDto.slug },
			})
			if (existSlug) throw new BadRequestException('Слаг занят')

			video.slug = updateVideoDto.slug
		}

		if (video.category.slug !== updateVideoDto.category) {
			const category = await this.categoryRepository.findOne({
				where: { slug: updateVideoDto.category },
			})
			if (!category) throw new NotFoundException('Категория не найдена')

			video.category = category
		}

		video.title = updateVideoDto.title
		video.description = updateVideoDto.description
		video.videoPath = updateVideoDto.videoPath
		video.bannerPath = updateVideoDto.bannerPath
		video.minAgeRestrictions = updateVideoDto.minAgeRestrictions
		video.duration = updateVideoDto.duration
		video.isPrivate = updateVideoDto.isPrivate

		await this.videoRepository.save(video)

		const { category: c, ...rest } = video

		return {
			video: rest,
		}
	}

	async deleteVideo(id: string, userId: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const isValidUserId = validate(userId)
		if (!isValidUserId) throw new BadRequestException('Неверный формат id')

		const video = await this.videoRepository.findOne({
			where: { id, author: { id: userId } },
		})
		if (!video) throw new NotFoundException('Видео не найдено')

		await this.videoRepository.delete(id)

		return {
			message: 'Видео удалено',
		}
	}

	async toggleLikeVideo(id: string, userId: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const isValidUserId = validate(userId)
		if (!isValidUserId) throw new BadRequestException('Неверный формат id')

		const video = await this.videoRepository.findOne({
			where: { id },
			relations: {
				likeUsers: true,
				disLikeUsers: true,
			},
		})
		if (!video) throw new NotFoundException('Видео не найдено')

		const user = await this.userRepository.findOne({ where: { id: userId } })
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (video.likeUsers.some(user => user.id === userId)) {
			video.likeUsers = video.likeUsers.filter(user => user.id !== userId)
			await this.videoRepository.save(video)

			return {
				message: 'Вы убрали лайк',
			}
		} else {
			video.likeUsers = [...video.likeUsers, user]
			if (video.disLikeUsers.some(user => user.id === userId)) {
				video.disLikeUsers = video.disLikeUsers.filter(
					user => user.id !== userId
				)
			}
			await this.videoRepository.save(video)

			return {
				message: 'Вы поставили лайк',
			}
		}
	}

	async toggleDisLikeVideo(id: string, userId: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const isValidUserId = validate(userId)
		if (!isValidUserId) throw new BadRequestException('Неверный формат id')

		const video = await this.videoRepository.findOne({
			where: { id },
			relations: {
				likeUsers: true,
				disLikeUsers: true,
			},
		})
		if (!video) throw new NotFoundException('Видео не найдено')

		const user = await this.userRepository.findOne({ where: { id: userId } })
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (video.disLikeUsers.some(user => user.id === userId)) {
			video.disLikeUsers = video.disLikeUsers.filter(user => user.id !== userId)
			await this.videoRepository.save(video)

			return {
				message: 'Вы убрали дизлайк',
			}
		} else {
			video.disLikeUsers = [...video.disLikeUsers, user]

			if (video.likeUsers.some(user => user.id === userId)) {
				video.likeUsers = video.likeUsers.filter(user => user.id !== userId)
			}

			await this.videoRepository.save(video)

			return {
				message: 'Вы поставили дизлайк',
			}
		}
	}

	async viewVideo(id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const video = await this.videoRepository.findOne({
			where: { id },
			relations: returnRelationVideo,
		})
		if (!video) throw new NotFoundException('Видео не найдено')

		video.countViews += 1

		await this.videoRepository.save(video)

		return {
			countViews: video.countViews,
		}
	}

	async checkExistingSlug(slug: string) {
		const video = await this.videoRepository.findOne({
			where: { slug },
		})
		if (video) {
			return {
				message: 'Слаг занят',
				access: false,
			}
		}

		return {
			message: 'Слаг свободен',
			access: true,
		}
	}

	async getTopVideos() {
		const videos = await this.videoRepository.find({
			where: {
				createdAt: MoreThan(new Date(Date.now() - 604800000)),
				countViews: MoreThanOrEqual(1),
			},
			relations: {
				author: true,
			},
		})

		videos.sort((a, b) => b.countViews - a.countViews).slice(0, 5)

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
			})),
		}
	}

	async getFullTopVideos() {
		const videos = await this.videoRepository.find({
			where: {
				createdAt: MoreThan(new Date(Date.now() - 2419200000)),
				countViews: MoreThanOrEqual(1),
			},
			relations: {
				author: true,
			},
		})

		videos.sort((a, b) => b.countViews - a.countViews)

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
			})),
		}
	}

	async getNewestVideos() {
		const videos = await this.videoRepository.find({
			order: {
				createdAt: 'DESC',
			},
			where: {
				createdAt: MoreThan(new Date(Date.now() - 604800000)),
			},
			relations: {
				author: true,
			},
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
			})),
		}
	}

	async getRecommendationVideos(userId: string) {
		const isValidUserId = validate(userId)
		if (!isValidUserId) throw new BadRequestException('Неверный формат id')

		const following = await this.userRepository.find({
			where: {
				followers: {
					id: userId,
				},
			},
			relations: {
				followers: true,
			},
		})

		const ids = following.map(user => user.id)

		const videos = await this.videoRepository.find({
			where: {
				author: {
					id: In(ids),
				},
				createdAt: MoreThan(new Date(Date.now() - 604800000 * 4)),
			},
			relations: {
				author: true,
			},
			order: {
				countViews: 'DESC',
				createdAt: 'DESC',
			},
		})

		if (videos && videos.length) {
			return {
				videos: videos.map(video => ({
					...video,
					author: video.author.returnUser(),
				})),
			}
		}
		return await this.getTopVideos()
	}

	async getVideosByCategorySlug(slug: string) {
		const videos = await this.videoRepository.find({
			where: {
				category: {
					slug,
				},
			},
			relations: {
				author: true,
			},
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
			})),
		}
	}

	async getVideoBySlug(
		slug: string,
		authHeader?: string,
		refreshToken?: string
	) {
		const video = await this.videoRepository.findOne({
			where: {
				slug,
			},
			relations: {
				author: true,
				likeUsers: true,
				disLikeUsers: true,
				category: true,
			},
		})

		if (!video) throw new NotFoundException('Видео не найдено')

		let accessData: any = null
		let refreshData: any = null

		if (authHeader && refreshToken) {
			if (authHeader.startsWith('Bearer')) {
				accessData = await this.jwtService.verifyAsync(authHeader.split(' ')[1])
			}
			refreshData = await this.jwtService.verifyAsync(refreshToken)
		}

		let resultVideo: any = null

		if (
			accessData &&
			refreshData &&
			accessData?.userId &&
			refreshData?.userId &&
			accessData?.userId === refreshData?.userId
		) {
			const user = await this.userRepository.findOne({
				where: { id: accessData?.userId },
			})

			if (!user) {
				resultVideo = {
					...video,
					author: video.author.returnUser(),
					countLike: video.likeUsers.length,
					countDisLike: video.disLikeUsers.length,
				}
			} else {
				resultVideo = {
					...video,
					author: video.author.returnUser(),
					isLike: video.likeUsers.some(u => u.id === user.id),
					isDisLike: video.disLikeUsers.some(u => u.id === user.id),
					countLike: video.likeUsers.length,
					countDisLike: video.disLikeUsers.length,
				}
			}
		} else {
			resultVideo = {
				...video,
				author: video?.author.returnUser(),
				countLike: video.likeUsers.length,
				countDisLike: video.disLikeUsers.length,
			}
		}

		delete resultVideo.likeUsers
		delete resultVideo.disLikeUsers

		return {
			video: resultVideo,
		}
	}

	async getCategoryAndVideos() {
		const categories = await this.categoryRepository.find()

		return await Promise.all(
			categories.map(async category => {
				const videos = await this.videoRepository.find({
					where: {
						category: {
							id: category.id,
						},
					},
					relations: {
						author: true,
					},
				})

				return {
					category,
					videos: videos.map(video => ({
						...video,
						author: video.author.returnUser(),
					})),
				}
			})
		)
	}

	async getVideosByProfile(id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const videos = await this.videoRepository.find({
			where: {
				author: {
					id,
				},
			},
			relations: {
				author: true,
			},
			order: {
				createdAt: 'DESC',
			},
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
			})),
		}
	}

	async getVideosByUserId(id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const videos = await this.videoRepository.find({
			where: {
				author: {
					id,
				},
			},
			relations: {
				author: true,
			},
			order: {
				createdAt: 'DESC',
			},
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
			})),
		}
	}

	async getSimilarVideos(id: string) {
		const isValid = validate(id)
		if (!isValid) throw new BadRequestException('Неверный формат id')

		const category = await this.categoryRepository.findOne({
			where: {
				videos: {
					id,
				},
			},
			relations: { videos: true },
		})

		const videos = await this.videoRepository.find({
			where: {
				category: {
					id: category.id,
				},
				id: Not(id),
			},
			relations: {
				author: true,
			},
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
			})),
		}
	}

	async getLikeVideos(id: string) {
		const videos = await this.videoRepository.find({
			where: {
				likeUsers: {
					id,
				},
			},
			relations: {
				author: true,
			},
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
			})),
		}
	}
}
