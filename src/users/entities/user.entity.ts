import { IpEntity } from 'src/ip.entity'
import {
	Column,
	Entity,
	Generated,
	OneToMany,
	BeforeInsert,
	ManyToMany,
	JoinTable,
} from 'typeorm'
import { UserRoleEnum } from '../enums/user-role.enum'
import { TypeAuthEnum } from '../enums/type-auth.enum'
import { generateCode } from 'src/utils/generateCode'
import { BaseEntity } from 'src/base.entity'
import { genSalt, hash } from 'bcryptjs'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { CommentEntity } from 'src/comments/entities/comment.entity'
import { NotificationEntity } from 'src/notifications/entities/notification.entity'

@Entity('users')
export class UserEntity extends BaseEntity {
	@Column()
	email: string

	@Column({ nullable: true })
	password: string

	@Column({ unique: true })
	name: string

	@Column({ name: 'date_of_birth', nullable: true })
	dateOfBirth: string

	@Column({ nullable: true })
	gender: 'male' | 'female'

	@Column({ nullable: true })
	age: number

	@Column({ nullable: true })
	country: string

	@Column({
		type: 'enum',
		enum: UserRoleEnum,
		default: UserRoleEnum.USER,
	})
	role: UserRoleEnum

	@Column({
		type: 'enum',
		enum: TypeAuthEnum,
		default: TypeAuthEnum.DEFAULT,
		name: 'type_auth',
	})
	typeAuth: TypeAuthEnum

	@Column({ name: 'avatar_path', default: '/uploads/user.png' })
	avatarPath: string

	@Column({ name: 'banner_path', default: '/uploads/banner.png' })
	bannerPath: string

	@Column({ default: '' })
	about: string

	@Generated('uuid')
	@Column({ name: 'activate_link' })
	activateLink: string

	@Column({ default: false })
	isActivated: boolean

	@Generated('uuid')
	@Column({ name: 'reset_link' })
	resetLink: string

	@Column({ default: generateCode(6) })
	code: number

	@OneToMany(() => IpEntity, ip => ip.user)
	ips: IpEntity[]

	@OneToMany(() => VideoEntity, video => video.author)
	videos: VideoEntity[]

	@ManyToMany(() => VideoEntity, video => video.likeUsers)
	@JoinTable({
		name: 'likeVideo_likeUser',
		joinColumn: {
			name: 'like_video_id',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'like_user_id',
			referencedColumnName: 'id',
		},
	})
	likeVideos: VideoEntity[]

	@ManyToMany(() => VideoEntity, video => video.disLikeUsers)
	@JoinTable({
		name: 'disLikeVideo_disLikeUser',
		joinColumn: {
			name: 'disLike_video_id',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'disLike_user_id',
			referencedColumnName: 'id',
		},
	})
	disLikeVideos: VideoEntity[]

	@OneToMany(() => CommentEntity, comment => comment.author)
	comments: CommentEntity[]

	@ManyToMany(() => CommentEntity, comment => comment.likeUsers)
	@JoinTable({
		name: 'likeComment_likeUser',
		joinColumn: {
			name: 'like_comment_id',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'like_user_id',
			referencedColumnName: 'id',
		},
	})
	likeComments: CommentEntity[]

	@ManyToMany(() => CommentEntity, comment => comment.disLikeUsers)
	@JoinTable({
		name: 'disLikeComment_disLikeUser',
		joinColumn: {
			name: 'disLike_comment_id',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'disLike_user_id',
			referencedColumnName: 'id',
		},
	})
	disLikeComments: CommentEntity[]

	@OneToMany(() => NotificationEntity, notification => notification.user)
	notifications: NotificationEntity[]

	@ManyToMany(() => UserEntity, user => user.followers)
	@JoinTable({
		name: 'following_followers',
		joinColumn: {
			name: 'following_id',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'follower_id',
			referencedColumnName: 'id',
		},
	})
	following: UserEntity[] // На кого ты подписан

	@ManyToMany(() => UserEntity, user => user.following)
	followers: UserEntity[] // те кто подписан на тебя

	@BeforeInsert()
	async hashPassword() {
		if (this.password) {
			const salt = await genSalt(10)
			this.password = await hash(this.password, salt)
		}
	}

	returnProfile() {
		const { activateLink, code, password, resetLink, ...rest } = this

		let data = rest

		if (rest.followers) {
			data = {
				...data,
				followers: rest.followers.map(user => user.returnUser()),
			}
		}

		if (rest.following) {
			data = {
				...data,
				following: rest.following.map(user => user.returnUser()),
			}
		}

		return {
			...data,
		}
	}

	returnUser() {
		const { email, isActivated, typeAuth, ...rest } = this.returnProfile()

		return {
			...rest,
		}
	}
}
