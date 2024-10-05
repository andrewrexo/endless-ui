import { serverUrl } from '$lib';
import * as Colyseus from 'colyseus.js'; // not necessary if included via <script> tag.

const client = new Colyseus.Client(serverUrl);

export const connect = () => {
	return client;
};
