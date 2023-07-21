import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/entities/user.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
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
import { DateEnum, DurationEnum, OrderEnum, SearchDto } from './dto/search.dto'
import { returnRelationsUser } from 'src/users/returnRelationsUser'
import { returnRelationVideo } from 'src/videos/returnRelationVideo'
import { translit } from 'src/utils/translitText'

@Injectable()
export class SearchService {
	constructor(
		@InjectRepository(VideoEntity)
		private videoRepository: Repository<VideoEntity>,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
	) {}

	async getSearchList() {
		const tags = [
			...new Set(
				[].concat(
					...(
						await this.videoRepository.find({
							where: {
								countViews: MoreThanOrEqual(10),
							},
						})
					).map(video => video.tags)
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

	async getSearchResult(searchDto: SearchDto) {
		const ruTranslit = translit(searchDto.query, 'ru')
		const enTranslit = translit(searchDto.query, 'en')

		const users = await this.userRepository.find({
			where: {
				videos: MoreThanOrEqual(1),
				name: In([ILike(`%${ruTranslit}%`), ILike(`%${enTranslit}%`)]),
			},
			relations: returnRelationsUser,
		})
		let order = {}

		searchDto.order === OrderEnum.NEWEST && (order['createdAt'] = 'DESC')
		searchDto.order === OrderEnum.OLDEST && (order['createdAt'] = 'ASC')
		searchDto.order === OrderEnum.VIEWS && (order['duration'] = 'DESC')

		const sort = {
			createdAt:
				searchDto.date === DateEnum.YEAR
					? MoreThanOrEqual(new Date(Date.now() - 604800000 * 52))
					: searchDto.date === DateEnum.MONTH
					? MoreThanOrEqual(new Date(Date.now() - 604800000 * 4))
					: searchDto.date === DateEnum.TODAY
					? MoreThanOrEqual(new Date(Date.now() - 604800000 / 7))
					: searchDto.date === DateEnum.WEEK
					? MoreThanOrEqual(new Date(Date.now() - 604800000))
					: MoreThanOrEqual(new Date(1970, 1, 1)),
			duration:
				searchDto.duration === DurationEnum.SHORT
					? LessThanOrEqual(300)
					: searchDto.duration === DurationEnum.LONG
					? And(MoreThan(300), LessThanOrEqual(1200))
					: searchDto.duration === DurationEnum.MEDIUM
					? And(MoreThan(1200), LessThanOrEqual(3600))
					: searchDto.duration === DurationEnum.MOVIE
					? MoreThan(3600)
					: MoreThanOrEqual(0),
		}

		const videos = await this.videoRepository.find({
			where: [
				{
					title: In([ILike(`%${ruTranslit}%`), ILike(`%${enTranslit}%`)]),
					...sort,
				},
				{
					description: In([ILike(`%${ruTranslit}%`), ILike(`%${enTranslit}%`)]),
					...sort,
				},
				{
					author: {
						name: In([ILike(`%${ruTranslit}%`), ILike(`%${enTranslit}%`)]),
					},
					...sort,
				},
				{
					tags: In([ILike(`%${ruTranslit}%`), ILike(`%${enTranslit}%`)]),
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
}
