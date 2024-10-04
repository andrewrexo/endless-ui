import http from 'http';
import { logger, Room, type Client } from 'colyseus';
import { Schema, MapSchema, type } from '@colyseus/schema';

export class Player extends Schema {
	@type('string') name: string = '';
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') targetTileX: number = 0;
	@type('number') targetTileY: number = 0;
	@type('boolean') isConnected: boolean = true;
	@type('string') direction: string = 'down';
}

export class State extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
}

export class HomeRoom extends Room<State> {
	// (optional) Validate client auth token before joining/creating the room
	static async onAuth(token: string, request: http.IncomingMessage) {}

	// When room is initialized
	onCreate(options: any) {
		this.setState(new State());
		console.log('HomeRoom created!', options);

		this.onMessage('player:add', (client, message) => {
			logger.info('player:add', message);

			const player = new Player();
			player.x = message.x;
			player.y = message.y;
			player.targetTileX = message.targetTileX; // Set targetTileX to the same as x
			player.targetTileY = message.targetTileY; // Set targetTileY to the same as y
			player.name = message.name;

			this.state.players.set(client.sessionId, player);

			// Broadcast the new player to all other clients
			this.broadcast(
				'player:joined',
				{
					sessionId: client.sessionId,
					...player
				},
				{ except: client }
			);
		});

		this.onMessage('player:update', (client, message) => {
			logger.info('player:update', message);

			const player = this.state.players.get(client.sessionId);
			if (player) {
				if (player.x !== message.x) player.x = message.x;
				if (player.y !== message.y) player.y = message.y;
				if (player.targetTileX !== message.targetTileX) player.targetTileX = message.targetTileX;
				if (player.targetTileY !== message.targetTileY) player.targetTileY = message.targetTileY;
				if (player.name !== message.name) player.name = message.name;
			}
		});

		this.onMessage('player:face', (client, message) => {
			const player = this.state.players.get(client.sessionId);

			if (player) {
				player.direction = message.direction;
			}

			this.broadcast(
				'player:face',
				{
					sessionId: client.sessionId,
					direction: player.direction,
					name: player.name
				},
				{ except: client }
			);
		});

		this.onMessage('player:move', (client, message) => {
			const player = this.state.players.get(client.sessionId);
			if (player) {
				player.x = message.x;
				player.y = message.y;
				player.targetTileX = message.targetTileX;
				player.targetTileY = message.targetTileY;

				logger.info('player:move', message);

				// Broadcast the movement to all other clients
				this.broadcast(
					'player:moved',
					{
						sessionId: client.sessionId,
						x: player.x,
						y: player.y,
						targetTileX: player.targetTileX,
						targetTileY: player.targetTileY
					},
					{ except: client }
				);
			}
		});
	}

	// When client successfully join the room
	onJoin(client: Client, options: any, auth: any) {
		console.log('HomeRoom joined!', client.sessionId);
		const existingPlayer = this.state.players.get(client.sessionId);
		if (existingPlayer) {
			existingPlayer.isConnected = true;
			// Broadcast to other clients that this player has reconnected
			this.broadcast('player:reconnected', { sessionId: client.sessionId });
		}
	}

	// When a client leaves the room
	onLeave(client: Client, consented: boolean) {
		console.log('HomeRoom left!', client.sessionId);
		const player = this.state.players.get(client.sessionId);
		if (player) {
			// Instead of deleting the player, mark them as disconnected
			this.state.players.delete(client.sessionId);

			// Broadcast to other clients that this player has disconnected
			this.broadcast('player:disconnected', { sessionId: client.sessionId, name: player.name });
		}
	}
}
