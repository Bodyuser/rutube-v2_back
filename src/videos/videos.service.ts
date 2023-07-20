import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { VideoEntity } from './entities/video.entity'
import { InjectRepository } from '@nestjs/typeorm'
import {
	And,
	ILike,
	In,
	LessThanOrEqual,
	MoreThan,
	MoreThanOrEqual,
	Not,
	Repository,
} from 'typeorm'
import { CreateVideoDto } from './dto/create-video.dto'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { UpdateVideoDto } from './dto/update-video.dto'
import { returnRelationVideo } from './returnRelationVideo'
import {
	DateEnum,
	DurationEnum,
	GetAllVideosDto,
	OrderEnum,
} from './dto/get-all-videos.dto'
import { NotificationsService } from 'src/notifications/notifications.service'
import { returnRelationsUser } from 'src/users/returnRelationsUser'

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
					user.id
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

	async getAllVideos(getAllVideosDto?: GetAllVideosDto) {
		const users = await this.userRepository.find({
			where: {
				videos: MoreThanOrEqual(1),
				name: ILike(`%${getAllVideosDto.query}%`),
			},
			relations: returnRelationsUser,
		})
		let order = {}

		getAllVideosDto.order === OrderEnum.NEWEST && (order['createdAt'] = 'DESC')
		getAllVideosDto.order === OrderEnum.OLDEST && (order['createdAt'] = 'ASC')
		getAllVideosDto.order === OrderEnum.VIEWS && (order['duration'] = 'DESC')

		const sort = {
			createdAt:
				getAllVideosDto.date === DateEnum.YEAR
					? MoreThanOrEqual(new Date(Date.now() - 604800000 * 52))
					: getAllVideosDto.date === DateEnum.MONTH
					? MoreThanOrEqual(new Date(Date.now() - 604800000 * 4))
					: getAllVideosDto.date === DateEnum.TODAY
					? MoreThanOrEqual(new Date(Date.now() - 604800000 / 7))
					: getAllVideosDto.date === DateEnum.WEEK
					? MoreThanOrEqual(new Date(Date.now() - 604800000))
					: MoreThanOrEqual(new Date(1970, 1, 1)),
			duration:
				getAllVideosDto.duration === DurationEnum.SHORT
					? LessThanOrEqual(300)
					: getAllVideosDto.duration === DurationEnum.LONG
					? And(MoreThan(300), LessThanOrEqual(1200))
					: getAllVideosDto.duration === DurationEnum.MEDIUM
					? And(MoreThan(1200), LessThanOrEqual(3600))
					: getAllVideosDto.duration === DurationEnum.MOVIE
					? MoreThan(3600)
					: MoreThanOrEqual(0),
		}

		const videos = await this.videoRepository.find({
			where: [
				{
					title: ILike(`%${getAllVideosDto.query}%`),
					...sort,
				},
				{
					description: ILike(`%${getAllVideosDto.query}%`),
					...sort,
				},
				{
					author: {
						name: ILike(`%${getAllVideosDto.query}%`),
					},
					...sort,
				},
				{
					tags: ILike(`%${getAllVideosDto.query}%`),
					...sort,
				},
			],
			order,
			relations: returnRelationVideo,
		})

		return {
			users: users.map(user => ({
				...user.returnUser(),
				followers: user.followers.map(user => user.returnUser()),
				following: user.following.map(user => user.returnUser()),
			})),
			videos: videos.map(video => ({
				...video,
				author: video.author.returnUser(),
				disLikeUsers: video.disLikeUsers.map(user => user.returnUser()),
				likeUsers: video.likeUsers.map(user => user.returnUser()),
			})),
		}
	}

	async getSearchList() {
		const tags = [
			...new Set(
				[].concat(
					...(await this.videoRepository.find()).map(video => video.tags)
				)
			),
		].map(item => item.toLowerCase())

		const names = (
			await this.userRepository.find({
				where: {
					followers: MoreThanOrEqual(1),
					name: Not(ILike('channel%')),
				},
				relations: {
					followers: true,
				},
			})
		).map(user => user.name.toLowerCase())

		const list = [...new Set(tags.concat([...names]))]

		return list.sort((a, b) => a.localeCompare(b))
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
