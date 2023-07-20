import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { UserEntity } from './users/entities/user.entity'

@Entity('ips')
export class IpEntity extends BaseEntity {
	@Column()
	ip: string

	@Column()
	country: string

	@Column()
	region: string

	@Column()
	city: string

	@Column({ default: false })
	isProxy: boolean

	@Column({ default: false })
	isVpn: boolean

	@Column()
	location: string

	@Column()
	timezone: string

	@Column()
	org: string

	@Column({ nullable: true })
	releaseDate: Date

	@ManyToOne(() => UserEntity, user => user.ips, {
		onDelete: 'CASCADE',
	})
	user: UserEntity
}
