import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/entities/user.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { ILike, MoreThanOrEqual, Not, Repository } from 'typeorm'

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
}
