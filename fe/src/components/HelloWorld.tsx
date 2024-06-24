import React, { useEffect, useState } from "react";
import { Api, LobbyGame } from "../api";
import { AxiosError } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GameScreen from "./GameScreen";
import Leaderboard from "./Leaderboard";

const api = new Api("http://localhost:8080");

const HelloWorld: React.FC = () => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [gameName, setGameName] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [joinedGames, setJoinedGames] = useState<Set<string>>(new Set());
  const [createdGames, setCreatedGames] = useState<Set<string>>(new Set());
  const [readyGames, setReadyGames] = useState<Set<string>>(new Set());
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [question, setQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchGames = async () => {
    try {
      const gameList = await api.fetchGameList();
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

  const fetchLeaderboard = async () => {
    try {
      const leaderboard = await api.fetchLeaderboard();
      setLeaderboard(leaderboard);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("Failed to fetch leaderboard: " + error.message);
      } else {
        console.error(
          "An unknown error occurred while fetching the leaderboard:",
          error
        );
        setError("An unknown error occurred. Please try again later.");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchLeaderboard();
  }, []);

  const handleConnect = () => {
    api.connectToServer(playerName, (event) => {
      console.log("handleConnect Message from server:", event.data);
      const data = JSON.parse(event.data);
      if (data.error) {
        toast.error(`${data.error}`);
      } else if (data.type === "game_player_enter") {
        setJoinedGames((prevJoinedGames) =>
          new Set(prevJoinedGames).add(data.id)
        );
      } else if (data.type === "game_join") {
        setJoinedGames((prevJoinedGames) =>
          new Set(prevJoinedGames).add(data.id)
        );
      } else if (data.type === "game_create") {
        fetchGames();
      } else if (data.type === "game_destroy") {
        fetchGames();
      } else if (data.type === "game_start") {
        console.log("Game started:", data.id);
        setIsGameStarted(true);
      } else if (data.type === "game_player_join") {
        // Handle player join
      } else if (data.type === "game_player_ready") {
        // TODO
      } else if (data.type === "game_player_leave") {
        // Handle player leave
      } else if (data.type === "game_countdown") {
        // Handle countdown
      } else if (data.type === "game_question") {
        setQuestion(data);
      } else if (data.type === "game_player_correct") {
        if (data.payload.player === playerName) {
          toast.success("Correct Answer!");
        }
      } else if (data.type === "game_player_incorrect") {
        if (data.payload.player === playerName) {
          toast.error("Incorrect Answer.");
        }
      } else if (data.type === "game_end") {
        setIsGameStarted(false);
        fetchLeaderboard();
        fetchGames();
      }
    });
    setIsConnected(true);
    // setPlayerName("");
  };

  const handleCreateGame = async () => {
    api.createGame(gameName, questionCount);
    setGameName("");
    setQuestionCount(5);
    // Refetch games list
    fetchGames();
  };

  const handleJoinGame = (game_id: string) => {
    console.log(`Joining game: ${game_id}`);
    api.joinGame(game_id);
    setReadyGames((prevJoinedGames) => new Set(prevJoinedGames).add(game_id));
  };

  const handleReadyGame = (game_id: string) => {
    api.readyGame(game_id);
    setReadyGames((prevReadyGames) => new Set(prevReadyGames).add(game_id));
  };

  const handleStartGame = (game_id: string) => {
    if (readyGames.has(game_id)) {
      //   toast.success(`Starting game with ID: ${game_id}`);
      api.startGame(game_id);
    } else {
      toast.error("Cannot start game: not all players are ready");
    }
  };

  const handleAnswerGame = (game_id: string, index: number, question_id) => {
    api.answerGame(game_id, index, question_id);
  };

  useEffect(() => {
    return () => {
      api.disconnect(); // Cleanup WebSocket connection on component unmount
      setIsConnected(false);
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
        <p>
          Connected as: <b>{playerName}</b>
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

      {isGameStarted && question ? (
        <GameScreen question={question} onAnswer={handleAnswerGame} />
      ) : (
        <>
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
                  {isConnected && game.state != "ended" && (
                    <div>
                      <button
                        onClick={() => handleJoinGame(game.id)}
                        className={`bg-blue-500 text-white px-4 py-2 rounded mt-2 ${
                          joinedGames.has(game.id)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        // disabled={
                        //   (joinedGames.has(game.id) && joinedGames.size != 0) ||
                        //   (!createdGames.has(game.id) &&
                        //     createdGames.size != 0) ||
                        //   game.state != "waiting"
                        // }
                      >
                        Join Game
                      </button>

                      {/* {joinedGames.has(game.id) && ( */}
                      <button
                        onClick={() => handleReadyGame(game.id)}
                        className={`bg-yellow-500 text-white px-4 py-2 rounded mt-2 ml-2 ${
                          readyGames.has(game.id)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        //   disabled={readyGames.has(game.id)}
                      >
                        Ready
                      </button>
                      {/* )} */}
                      {/* {joinedGames.has(game.id) &&
                        createdGames.has(game.id) &&
                        game.state === "waiting" && ( */}
                      <button
                        onClick={() => handleStartGame(game.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded mt-2 ml-2"
                      >
                        Start Game
                      </button>
                      {/* )} */}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <hr className="mt-4"></hr>

      <Leaderboard
        leaderboard={leaderboard}
        loading={isLoading}
        error={error}
      />
    </div>
  );
};

export default HelloWorld;
