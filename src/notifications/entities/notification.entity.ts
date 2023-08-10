import { BaseEntity } from 'src/base.entity'
import { CommentEntity } from 'src/comments/entities/comment.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'

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

	@ManyToOne(() => VideoEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'video_id' })
	video: VideoEntity

	@ManyToOne(() => CommentEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'comment_id' })
	comment: CommentEntity

	@ManyToOne(() => UserEntity, user => user.notifications, {
		onDelete: 'CASCADE',
	})
	user: UserEntity
}
