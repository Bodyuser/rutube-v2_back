import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { UserEntity } from './users/entities/user.entity'

@Entity('ips')
export class IpEntity extends BaseEntity {
	@Column()
	ip: string

	@Column({ nullable: true })
	country: string

	@Column({ nullable: true })
	region: string

	@Column({ nullable: true })
	city: string

	@Column({ default: false })
	isProxy: boolean

	@Column({ default: false })
	isVpn: boolean

	@Column({ nullable: true })
	location: string

	@Column({ nullable: true })
	timezone: string

	@Column({ nullable: true })
	org: string

	@Column({ nullable: true })
	releaseDate: Date

	@ManyToOne(() => UserEntity, user => user.ips, {
		onDelete: 'CASCADE',
	})
	user: UserEntity
}
