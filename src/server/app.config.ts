import config from '@colyseus/tools';
import { Server } from '@colyseus/core';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';
import { BunWebSockets } from '@colyseus/bun-websockets';
import { HomeRoom } from './room/home-room';

export default config({
	initializeTransport: () => {
		return new BunWebSockets();
	},
	initializeGameServer: (gameServer: Server) => {
		gameServer.define('home_room', HomeRoom);
	},
	initializeExpress: (app) => {
		if (Boolean(process.env.PLAYGROUND)) {
			app.use('/', playground);
		}

		// todo: password protect route
		app.use('/monitor', monitor());
	}
});
