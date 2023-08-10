import { BaseEntity } from 'src/base.entity'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { CommentEntity } from 'src/comments/entities/comment.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm'

@Entity('videos')
export class VideoEntity extends BaseEntity {
	@Column()
	title: string

	@Column({ unique: true })
	slug: string

	@Column()
	description: string

	@Column()
	videoPath: string

	@Column()
	bannerPath: string

	@Column()
	minAgeRestrictions: number

	@Column()
	duration: number

	@Column({ default: 0 })
	countViews: number

	@Column('simple-array')
	tags: string[]

	@Column({ name: 'is_private' })
	isPrivate: boolean

	@ManyToOne(() => CategoryEntity, category => category.videos)
	category: CategoryEntity

	@OneToMany(() => CommentEntity, comment => comment.video)
	comments: CommentEntity[]

	@ManyToOne(() => UserEntity, user => user.videos, { onDelete: 'CASCADE' })
	author: UserEntity

	@ManyToMany(() => UserEntity, user => user.likeVideos, {
		onDelete: 'CASCADE',
	})
	likeUsers: UserEntity[]

	@ManyToMany(() => UserEntity, user => user.disLikeVideos, {
		onDelete: 'CASCADE',
	})
	disLikeUsers: UserEntity[]
}
