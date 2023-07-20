import { BaseEntity } from 'src/base.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { Column, Entity, ManyToOne } from 'typeorm'

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

	@ManyToOne(() => UserEntity, user => user.notifications, {
		onDelete: 'CASCADE',
	})
	user: UserEntity
}
