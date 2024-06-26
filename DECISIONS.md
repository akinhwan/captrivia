# DECISIONS

## Technical Stack

- Chose React + Typescript for the UI Components, and Tailwind for quick styling within jsx.
- Axios was pre-installed in the starter repo, but that was used for making /get requests for the /games and /leaderboard endpoints.
- `react-router-dom` was used for routing between /home (Home.tsx), /game (Game.tsx) and /leaderboard (Leaderboard.tsx) views.
- `react-toastify` was for showing success and error messages from the server instantly to the user for a better UX.

## WebSocket Handling

- Initially used `socket.io-client` for real-time communication between the frontend and backend. But ran into a CORS related issue, reverted to using the basic `WebSocket` web api.
- Refactored websocket related logic into it's own custom hook called `useWebSocket.ts`.

## Game Logic

- Implemented game state handling based on received WebSocket events. Created a `GameContext.tsx` which utilizes the Context API for sharing of `gameState` between `Game.tsx` and `useWebSocket.ts`.
- The `Game.tsx` component conditionally renders information bout the game or the question itself when the game is formally started.
- The ready button is conditionally disabled depending on whether the player is Ready or not.
- The start game button is conditionally rendered according to whether the player is the game's creator or not.
- Players are routed to the `/leaderboard` page after the game ends, and given a link to navigate back `/home`.

## UI Components

- Home is used for connecting to the server, creating a game, and joining a game.
- Game is used for showing the players and which players are ready.
  When a game is started, it displays the questions one at a time.
- Leaderboard displays a table of the response from the server.

## Questions

- Should api.ts have a leaveGame()? would probably take a game_id and player_name. Never saw the "game_player_leave" event message sent from server.

## Improvements

- If current player is on the leaderboard, highlight the row
- Could persist question_count and display `x/n questions` so the players are aware of how many questions have passed, and how many questions remain.
- The timer could be a progress bar using a simple rectangle instead of numbers to alleviate stress.
- The timer (line 158 of `Game.tsx`) should be separated out into a smaller subcomponent (especially because it causes a re-render every second) but I left it for now.
