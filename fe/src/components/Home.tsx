import React, { useEffect } from "react";

const Home: React.FC = ({
  games,
  fetchGames,
  fetchLeaderboard,
  isConnected,
  playerName,
  setPlayerName,
  handleConnect,
  gameName,
  setGameName,
  questionCount,
  setQuestionCount,
  handleCreateGame,
  isLoading,
  error,
  handleJoinGame,
}) => {
  useEffect(() => {
    fetchGames();
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto p-8">
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
            className="border p-2 mb-4 ml-2"
          />
          <button
            onClick={handleConnect}
            className="bg-blue-500 text-white px-4 py-2 ml-2 rounded"
          >
            Connect
          </button>
        </div>
      ) : (
        <p className="fixed top-4 right-4">
          Player Name: <b>{playerName}</b>
        </p>
      )}
      {isConnected && (
        <div className="mb-4 mt-6">
          <h3 className="text-xl mb-2">Create a New Game</h3>
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
            className="border p-2 mb-2 ml-2"
          />
          <button
            onClick={handleCreateGame}
            className="bg-green-500 text-white px-4 py-2 ml-2 rounded"
          >
            Create Game
          </button>
        </div>
      )}

      <hr className="mt-4"></hr>

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
              {isConnected && game.state != "ended" && (
                <div>
                  <button
                    onClick={() => handleJoinGame(game.id)}
                    className={`bg-blue-500 text-white px-4 py-2 rounded mt-2`}
                  >
                    Join Game
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;
