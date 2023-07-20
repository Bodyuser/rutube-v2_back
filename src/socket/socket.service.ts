import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import IPinfoWrapper, { IPinfo } from 'node-ipinfo'
import { IpEntity } from 'src/ip.entity'
import { NotificationsService } from 'src/notifications/notifications.service'
import { UserEntity } from 'src/users/entities/user.entity'
import { Repository } from 'typeorm'

const ipinfoWrapper = new IPinfoWrapper(process.env.IP_INFO_TOKEN)

@Injectable()
export class SocketService {
	constructor(
		@InjectRepository(IpEntity)
		private ipRepository: Repository<IpEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private notificationsService: NotificationsService
	) {}

	onlineUsers: {
		id: string
		socketId: string
	}[] = []

	async join(userId: string, socketId: string, disconnect: any) {
		const user = await this.userRepository.findOne({ where: { id: userId } })
		if (!user) return disconnect()

		const data = {
			socketId,
			id: userId,
		}

		this.onlineUsers.push(data)

		user.online = true

		await this.userRepository.save(user)

		let i = ''

		let ipData: IPinfo = {} as IPinfo

		await axios
			.get('https://ipinfo.io/ip')
			.then(response => (i = response.data))

		await ipinfoWrapper.lookupIp(i).then((response: IPinfo) => {
			ipData = response
		})

		const lastIp = await this.ipRepository.findOne({
			order: {
				createdAt: 'DESC',
			},
			where: {
				user: {
					id: userId,
				},
			},
			relations: {
				user: true,
			},
		})

		const ip = this.ipRepository.create({
			...ipData,
			location: ipData.loc,
			isProxy: ipData.privacy.proxy,
			isVpn: ipData.privacy.vpn,
			org: ipData.company.name,
			user,
		})

		await this.ipRepository.save(ip)

		const hours =
			Math.abs(
				new Date(ip.createdAt).getTime() - new Date(lastIp.createdAt).getTime()
			) / 36e5

		if (lastIp.country !== ip.country && hours < 3) {
			await this.notificationsService.createNotification(
				`Кто-то заходил на ваш аккаунт, местоположение входа: ${ip.country}, ${ip.city}. Поменяйте пароль, если это не вы`,
				'strange-entrance',
				'/profile/edit',
				user.id
			)
		}

		return {
			message: 'OK',
		}
	}

	async leave(socketId: string) {
		const data = this.onlineUsers.find(user => user.socketId === socketId)
		if (!data?.id) return

		const user = await this.userRepository.findOne({
			where: {
				id: data.id,
			},
		})

		if (!user) return

		user.online = false

		await this.userRepository.save(user)

		const ip = await this.ipRepository.findOne({
			relations: { user: true },
			where: { user: { id: user.id } },
		})

		ip.releaseDate = new Date()

		return {
			message: 'OK',
		}
	}
}
