# Hometown

Hometown is a web-based multiplayer online game built with Phaser 3, Svelte 5, Tauri, and Colyseus.js. It features an isometric game world where players can interact, chat, and explore together.

More features are planned; at the moment it's more of a social experience & proof of concept.

<img width="400" alt="image" src="https://github.com/user-attachments/assets/4da0420f-4f3d-4b1f-9239-d5d3f96037d8">

## Features

- Isometric game world
- Multi-layered maps
- Custom map renderer built for performance
- 100+ players, NPCs, and map objects all on screen at 60 FPS
- Real-time multiplayer interactions
- Chat system
- Inventory management
- Customizable UI components
- Responsive design for various screen sizes
- Build to native app w/ Tauri

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/andrewrexo/hometown.git
   cd hometown
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Server Setup

To run the Colyseus server:

```bash
bun run dev:server
```


## Contributing

Contributions are welcome! Please follow these steps if you'd like to contribute to this repo:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## Acknowledgments

- Phaser game framework
- Svelte for reactive UI components
- Colyseus for real-time multiplayer functionality
- Tauri for desktop application support

---

For more detailed information about the project structure and components, please refer to the following key files:

- `src/game/main.ts`: Main game configuration
- `src/server/room/home-room.ts`: Server-side room logic
- `src/game/PhaserGame.svelte`: Main Svelte component for rendering the game

These files contain the core game configuration, server-side room logic, and the main Svelte component for rendering the game, respectively.
