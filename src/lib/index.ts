// place files you want to import through the `$lib` alias in this folder.

export const serverUrl = import.meta.env.DEV ? 'ws://localhost:2567' : 'wss://tezos.zip';

export interface Position {
	x: number;
	y: number;
}
