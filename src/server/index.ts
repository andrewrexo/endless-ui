import express from 'express';
import { createServer } from 'http';
import { Server } from 'colyseus';
import { HomeRoom } from './room/home-room';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { BunWebSockets } from '@colyseus/bun-websockets';

const app = express();
const server = createServer(app);

const gameServer = new Server({
	transport: new BunWebSockets({
		server,
		pingInterval: 6000,
		pingMaxRetries: 4
	})
	// driver: new RedisDriver(),
	// presence: new RedisPresence(),
});

gameServer.define('home_room', HomeRoom);
gameServer.listen(2567);
