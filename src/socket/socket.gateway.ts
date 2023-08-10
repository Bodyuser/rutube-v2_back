import {
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'
import { UseGuards } from '@nestjs/common'
import { SocketService } from './socket.service'
import { Server, Socket } from 'socket.io'
import { User } from 'src/users/decorators/user.decorator'
import { CheckAuthSocketGuard } from './socket.guard'

@WebSocketGateway({
	cors: {
		origin: process.env.APP_URL,
	},
})
export class SocketGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	constructor(private readonly socketService: SocketService) {}

	afterInit(server: Server) {}

	async handleConnection(client: Socket, ...args: any[]) {}

	async handleDisconnect(client: Socket) {
		const data = await this.socketService.leave(client.id)

		if (data?.onlineUsers) {
			this.server.emit('online-users', data.onlineUsers)
			return data.onlineUsers
		}

		return
	}

	@WebSocketServer()
	server: Server

	getOnlineUsers() {
		return this.socketService.getOnlineUsers()
	}

	@UseGuards(CheckAuthSocketGuard)
	@SubscribeMessage('join')
	async join(@User('id') id: string, @ConnectedSocket() client: Socket) {
		const data = await this.socketService.join(id, client.id, client.disconnect)

		if (data.onlineUsers) {
			this.server.emit('online-users', data.onlineUsers)
			console.log(data?.onlineUsers)
			return data.onlineUsers
		}

		return
	}
}
