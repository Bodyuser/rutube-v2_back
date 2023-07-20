import { BaseEntity } from 'src/base.entity'
import { VideoEntity } from 'src/videos/entities/video.entity'
import { Column, Entity, OneToMany } from 'typeorm'

@Entity('categories')
export class CategoryEntity extends BaseEntity {
	@Column()
	title: string

	@Column()
	imagePath: string

	@Column({ unique: true })
	slug: string

	@OneToMany(() => VideoEntity, video => video.category)
	videos: VideoEntity[]
}
