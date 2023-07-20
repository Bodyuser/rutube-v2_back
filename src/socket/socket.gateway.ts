import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'
import { SocketService } from './socket.service'
import * as process from 'process'
import { Server, Socket } from 'socket.io'

@WebSocketGateway(80, {
	cors: {
		origin: process.env.APP_URL,
	},
})
export class SocketGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	constructor(private readonly socketService: SocketService) {}

	afterInit(server: Server) {}

	async handleConnection(client: Socket, ...args: any[]) {
		console.log('connect', client.id)
	}

	async handleDisconnect(client: Socket) {
		const data = await this.socketService.leave(client.id)

		this.server.emit('online-users', 'leave-user')

		return data
	}

	@WebSocketServer()
	server: Server

	@SubscribeMessage('join')
	async join(@MessageBody('id') id: string, @ConnectedSocket() client: Socket) {
		const data = await this.socketService.join(id, client.id, client.disconnect)

		this.server.emit('online-users', 'join-user')

		return data
	}
}
