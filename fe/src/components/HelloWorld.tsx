import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useWebSocket } from "./useWebSocket";

const HelloWorld: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [gameName, setGameName] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5); // Default question count

  const {
    games,
    joinedGames,
    createdGames,
    readyGames,
    isConnected,
    isLoading,
    error,
    handleConnect,
    createGame,
    joinGame,
    startGame,
    readyGame,
  } = useWebSocket(playerName);

  const handleCreateGame = async () => {
    createGame(gameName, questionCount);
    setGameName("");
    setQuestionCount(5); // Reset question count to default
  };

  return (
    <div className="container mx-auto">
      <ToastContainer position="bottom-center" autoClose={5000} />
      <h1 className="text-2xl font-bold mb-4">Game List</h1>
      {!isConnected ? (
        <div>
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
              <p>
                Players: {game.players?.join(", ") || "No players joined yet"}
              </p>
              {isConnected && (
                <div>
                  <button
                    onClick={() => joinGame(game.id)}
                    className={`bg-blue-500 text-white px-4 py-2 rounded mt-2 ${
                      joinedGames.has(game.id)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={joinedGames.has(game.id)}
                  >
                    Join Game
                  </button>
                  {joinedGames.has(game.id) && (
                    <button
                      onClick={() => readyGame(game.id)}
                      className={`bg-yellow-500 text-white px-4 py-2 rounded mt-2 ${
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
                        onClick={() => startGame(game.id)}
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
