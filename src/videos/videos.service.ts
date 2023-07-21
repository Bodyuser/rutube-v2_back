import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { VideoEntity } from './entities/video.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { In, MoreThan, MoreThanOrEqual, Repository } from 'typeorm'
import { CreateVideoDto } from './dto/create-video.dto'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { UpdateVideoDto } from './dto/update-video.dto'
import { returnRelationVideo } from './returnRelationVideo'
import { NotificationsService } from 'src/notifications/notifications.service'

@Injectable()
export class VideosService {
	constructor(
		@InjectRepository(VideoEntity)
		private videoRepository: Repository<VideoEntity>,
		@InjectRepository(CategoryEntity)
		private categoryRepository: Repository<CategoryEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private notificationsService: NotificationsService
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

		return {
			video: {
				...video,
				author: author.returnUser(),
			},
		}
	}

	async updateVideo(
		updateVideoDto: UpdateVideoDto,
		id: string,
		userId: string
	) {
		const video = await this.videoRepository.findOne({
			where: { id, author: { id: userId } },
			relations: returnRelationVideo,
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

		await this.videoRepository.save(video)

		return {
			video: {
				...video,
				author: video.author.returnUser(),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
			},
		}
	}

	async deleteVideo(id: string, userId: string) {
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
		const video = await this.videoRepository.findOne({
			where: { id },
			relations: returnRelationVideo,
		})
		if (!video) throw new NotFoundException('Видео не найдено')

		const user = await this.userRepository.findOne({ where: { id: userId } })
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (video.likeUsers.some(user => user.id === userId)) {
			video.likeUsers = video.likeUsers.filter(user => user.id !== userId)
		} else {
			video.likeUsers = [...video.likeUsers, user]

			if (video.disLikeUsers.some(user => user.id === userId)) {
				video.disLikeUsers = video.disLikeUsers.filter(
					user => user.id !== userId
				)
			}
		}

		await this.videoRepository.save(video)

		return {
			video: {
				...video,
				author: video.author.returnUser(),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
			},
		}
	}

	async toggleDisLikeVideo(id: string, userId: string) {
		const video = await this.videoRepository.findOne({
			where: { id },
			relations: returnRelationVideo,
		})
		if (!video) throw new NotFoundException('Видео не найдено')

		const user = await this.userRepository.findOne({ where: { id: userId } })
		if (!user) throw new NotFoundException('Пользователь не найден')

		if (video.disLikeUsers.some(user => user.id === userId)) {
			video.disLikeUsers = video.disLikeUsers.filter(user => user.id !== userId)
		} else {
			video.disLikeUsers = [...video.disLikeUsers, user]

			if (video.likeUsers.some(user => user.id === userId)) {
				video.likeUsers = video.likeUsers.filter(user => user.id !== userId)
			}
		}

		await this.videoRepository.save(video)

		return {
			video: {
				...video,
				author: video.author.returnUser(),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
			},
		}
	}

	async viewVideo(id: string) {
		const video = await this.videoRepository.findOne({
			where: { id },
			relations: returnRelationVideo,
		})
		if (!video) throw new NotFoundException('Видео не найдено')

		video.countViews += 1

		await this.videoRepository.save(video)

		return {
			video: {
				...video,
				author: video.author.returnUser(),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
			},
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
			relations: returnRelationVideo,
		})

		videos.sort((a, b) => b.countViews - a.countViews).slice(0, 5)

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
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
			relations: returnRelationVideo,
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
			})),
		}
	}

	async getRecommendationVideos(userId: string) {
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
			relations: returnRelationVideo,
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
					disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
					likeUsers: video.likeUsers.map(user => user.returnUser()),
				})),
			}
		}
		return await this.getTopVideos()
	}

	async getVideosByCategory(id: string) {
		const videos = await this.videoRepository.find({
			where: {
				category: {
					id,
				},
			},
			relations: returnRelationVideo,
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
			})),
		}
	}

	async getVideoBySlug(slug: string) {
		const video = await this.videoRepository.findOne({
			where: {
				slug,
			},
			relations: returnRelationVideo,
		})

		return {
			video: {
				...video,
				author: video.author.returnUser(),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
			},
		}
	}

	async getCategoryAndVideo() {
		const categories = await this.categoryRepository.find()

		return await Promise.all(
			categories.map(async category => {
				const videos = await this.videoRepository.find({
					where: {
						category: {
							id: category.id,
						},
					},
					relations: returnRelationVideo,
				})

				return {
					category,
					videos: videos.map(video => ({
						...video,
						author: video.author.returnUser(),
						disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
						likeUsers: video.likeUsers.map(user => user.returnUser()),
					})),
				}
			})
		)
	}

	async getVideosByProfile(id: string) {
		const videos = await this.videoRepository.find({
			where: {
				author: {
					id,
				},
			},
			relations: returnRelationVideo,
			order: {
				createdAt: 'DESC',
			},
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
			})),
		}
	}

	async getVideosByUser(id: string) {
		const videos = await this.videoRepository.find({
			where: {
				author: {
					id,
				},
			},
			relations: returnRelationVideo,
			order: {
				createdAt: 'DESC',
			},
		})

		return {
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
			})),
		}
	}
}
