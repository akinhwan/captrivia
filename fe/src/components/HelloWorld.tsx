import React, { useEffect, useState } from "react";
import { Api, LobbyGame } from "../api";
import { AxiosError } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const api = new Api("http://localhost:8080"); // Ensure this matches your backend address

const HelloWorld: React.FC = () => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [gameName, setGameName] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5); // Default question count
  const [joinedGames, setJoinedGames] = useState<Set<string>>(new Set());
  const [createdGames, setCreatedGames] = useState<Set<string>>(new Set()); // Track created games
  const [readyGames, setReadyGames] = useState<Set<string>>(new Set()); // Track ready games

  //   const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);

  const fetchGames = async () => {
    try {
      const gameList = await api.fetchGameList();
      console.log(gameList);
      setGames(gameList);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("Failed to fetch game list: " + error.message);
      } else {
        console.error(
          "An unknown error occurred while fetching the game list:",
          error
        );
        setError("An unknown error occurred. Please try again later.");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleConnect = () => {
    api.connectToServer(playerName, (event) => {
      console.log("Message from server:", event.data);
      const data = JSON.parse(event.data);
      if (data.error) {
        toast.error(`Error: ${data.error}`);
      } else if (data.type === "game_player_enter") {
        // setGames((prevGames) => {
        //   const gameExists = prevGames.some(
        //     (game) => game.id === data.payload.id
        //   );
        //   if (gameExists) {
        //     return prevGames.map((game) =>
        //       game.id === data.payload.id
        //         ? { ...game, players: data.payload.players }
        //         : game
        //     );
        //   } else {
        //     return [
        //       ...prevGames,
        //       { ...data.payload, players: data.payload.players },
        //     ];
        //   }
        // });
        // TODO: just because you entered doesn't mean you created
        setCreatedGames((prevCreatedGames) =>
          new Set(prevCreatedGames).add(data.id)
        );
        setJoinedGames((prevJoinedGames) =>
          new Set(prevJoinedGames).add(data.id)
        );
      } else if (data.type === "game_join") {
        setJoinedGames((prevJoinedGames) =>
          new Set(prevJoinedGames).add(data.id)
        );
      } else if (data.type === "game_destroy") {
        // setGames((prevGames) =>
        //   prevGames.filter((game) => game.id !== data.id)
        // );
      } else if (data.type === "game_start") {
        console.log("Game started:", data.id);
        // change UI to show question
        // show countdown
        // show other info
      } else if (data.type === "game_player_join") {
        // Handle player join
        // setGames((prevGames) =>
        //   prevGames.map((game) =>
        //     game.id === data.id
        //       ? {
        //           ...game,
        //           players: [...(game.players || []), data.payload.player],
        //         }
        //       : game
        //   )
        // );
      } else if (data.type === "game_player_ready") {
        // setGames((prevGames) =>
        //   prevGames.map((game) =>
        //     game.id === data.id
        //       ? {
        //           ...game,
        //           players: [...(game.players || []), data.payload.player],
        //         }
        //       : game
        //   )
        // );
      } else if (data.type === "game_player_leave") {
        // Handle player leave
        // setGames((prevGames) =>
        //   prevGames.map((game) =>
        //     game.id === data.id
        //       ? {
        //           ...game,
        //           players: (game.players || []).filter(
        //             (player) => player !== data.payload.player
        //           ),
        //         }
        //       : game
        //   )
        // );
      } else if (data.type === "game_countdown") {
        // Handle player leave
        // setGames((prevGames) =>
        //   prevGames.map((game) =>
        //     game.id === data.id
        //       ? {
        //           ...game,
        //           players: (game.players || []).filter(
        //             (player) => player !== data.payload.player
        //           ),
        //         }
        //       : game
        //   )
        // );
      } else if (data.type === "game_question") {
        // Handle player leave
        // setGames((prevGames) =>
        //   prevGames.map((game) =>
        //     game.id === data.id
        //       ? {
        //           ...game,
        //           players: (game.players || []).filter(
        //             (player) => player !== data.payload.player
        //           ),
        //         }
        //       : game
        //   )
        // );
      }
    });
    setIsConnected(true);
  };

  const handleCreateGame = async () => {
    api.createGame(gameName, questionCount);
    setGameName("");
    setQuestionCount(5); // Reset question count to default

    // Refetch games list to get the latest state from the server
    fetchGames();
  };

  const handleJoinGame = (gameId: string) => {
    api.joinGame(gameId);
    // setSelectedGameId(gameId);
  };

  const handleReadyGame = (gameId: string) => {
    api.readyGame(gameId);
    setReadyGames((prevReadyGames) => new Set(prevReadyGames).add(gameId));
  };

  const handleStartGame = (gameId: string) => {
    if (readyGames.has(gameId)) {
      console.log(`Starting game with ID: ${gameId}`);
      api.startGame(gameId);
    } else {
      console.error("Cannot start game: not all players are ready");
    }
  };

  useEffect(() => {
    return () => {
      api.disconnect(); // Cleanup WebSocket connection on component unmount
    };
  }, []);

  return (
    <div className="container mx-auto p-8">
      <ToastContainer position="bottom-center" autoClose={5000} />
      <h1 className="text-4xl font-bold mb-4">Captrivia</h1>
      <h2 className="text-lg mb-4">A trivia game about cap tables!</h2>
      {!isConnected ? (
        <div>
          <label>Join the world server</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="border p-2 mb-4"
          />
          <button
            onClick={handleConnect}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Connect
          </button>
        </div>
      ) : (
        <p>Connected as {playerName}</p>
      )}
      {isConnected && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Create a New Game</h2>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Enter game name"
            className="border p-2 mb-2"
          />
          <input
            type="number"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            placeholder="Enter number of questions"
            className="border p-2 mb-2"
          />
          <button
            onClick={handleCreateGame}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Game
          </button>
        </div>
      )}
      <hr></hr>
      <h3 className="text-xl mt-4 mb-4">Game List</h3>

      {isLoading ? (
        <p>Loading games...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : games.length === 0 ? (
        <p>No games available.</p>
      ) : (
        <ul className="space-y-2">
          {games.map((game) => (
            <li key={game.id} className="bg-gray-100 p-4 rounded">
              <h2 className="text-xl font-semibold">{game.name}</h2>
              <p>Question Count: {game.question_count}</p>
              <p>State: {game.state}</p>
              {/* <p>Players: {game.player_count}</p> */}
              {isConnected && (
                <div>
                  {!createdGames.has(game.id) && (
                    <button
                      onClick={() => handleJoinGame(game.id)}
                      className={`bg-blue-500 text-white px-4 py-2 rounded mt-2 ${
                        joinedGames.has(game.id)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={joinedGames.has(game.id)}
                    >
                      Join Game
                    </button>
                  )}
                  {joinedGames.has(game.id) && (
                    <button
                      onClick={() => handleReadyGame(game.id)}
                      className={`bg-yellow-500 text-white px-4 py-2 rounded mt-2 ml-2 ${
                        readyGames.has(game.id)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={readyGames.has(game.id)}
                    >
                      Ready
                    </button>
                  )}
                  {joinedGames.has(game.id) &&
                    createdGames.has(game.id) &&
                    game.state === "waiting" && (
                      <button
                        onClick={() => handleStartGame(game.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded mt-2 ml-2"
                      >
                        Start Game
                      </button>
                    )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HelloWorld;
