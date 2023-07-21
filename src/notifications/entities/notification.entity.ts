import { BaseEntity } from 'src/base.entity'
import { CommentEntity } from 'src/comments/entities/comment.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm'

@Entity('notifications')
export class NotificationEntity extends BaseEntity {
	@Column()
	type:
		| 'reply-to-comment'
		| 'upload-video'
		| 'comment-to-video'
		| 'strange-entrance'

	@Column()
	text: string

	@Column()
	url: string

	@Column({ default: false })
	read: boolean

	@OneToOne(() => VideoEntity, { onDelete: 'CASCADE' })
	video: VideoEntity

	@OneToOne(() => CommentEntity, { onDelete: 'CASCADE' })
	comment: CommentEntity

	@ManyToOne(() => UserEntity, user => user.notifications, {
		onDelete: 'CASCADE',
	})
	user: UserEntity
}
