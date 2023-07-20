import { BaseEntity } from 'src/base.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm'

@Entity('comments')
export class CommentEntity extends BaseEntity {
	@Column()
	text: string

	@ManyToOne(() => VideoEntity, video => video.comments, {
		onDelete: 'CASCADE',
	})
	video: VideoEntity

	@Column()
	type: 'comment' | 'reply-comment'

	@ManyToOne(() => UserEntity, user => user.comments, { onDelete: 'CASCADE' })
	author: UserEntity

	@ManyToMany(() => UserEntity, user => user.likeComments)
	likeUsers: UserEntity[]

	@ManyToMany(() => UserEntity, user => user.disLikeComments)
	disLikeUsers: UserEntity[]

	@OneToMany(() => CommentEntity, comment => comment.mainComment)
	replyComments: CommentEntity[]

	@ManyToOne(() => CommentEntity, comment => comment.replyComments, {
		onDelete: 'CASCADE',
	})
	mainComment: CommentEntity
}
