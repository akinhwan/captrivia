import React, { useEffect, useState } from "react";
import { Api, LobbyGame } from "../api";
import { AxiosError } from "axios";
import axios from "axios";
import io from "socket.io-client";

const api = new Api("http://localhost:8080");

const Captrivia: React.FC = () => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [gameId, setGameId] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [gameState, setGameState] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [question, setQuestion] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
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

    fetchGames();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        setConnected(true);
        console.log("Connected to server");
      });

      socket.on("disconnect", () => {
        setConnected(false);
        console.log("Disconnected from server");
      });

      socket.on("game_event", (data: any) => {
        handleGameEvent(data);
      });

      socket.on("connect_error", (err) => {
        console.error("Connection error:", err.message);
        setError(`Connection error: ${err.message}`);
      });

      socket.on("error", (error: any) => {
        console.error("Socket error:", error);
      });
    }

    // return () => {
    //   socket.off('connect', )
    // }
  }, [socket]);

  const handleGameEvent = (data: any) => {
    switch (data.type) {
      case "game_state_change":
        setGameState(data.payload.state);
        break;
      case "game_question":
        setQuestion(data.payload);
        break;
      case "game_end":
        setScores(data.payload.scores);
        break;
      case "game_player_join":
        setPlayers((prevPlayers) => [...prevPlayers, data.payload.player]);
        break;
      default:
        break;
    }
  };

  //   const handleConnect = async () => {
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:8080/connect?name=${name}`,
  //         {
  //           withCredentials: true,
  //           headers: {
  //             "Access-Control-Allow-Origin": "http://localhost:5173", // Your frontend URL
  //             "Access-Control-Allow-Credentials": "true",
  //           },
  //         }
  //       );
  //       console.log("Connected:", response.data);
  //     } catch (err) {
  //       setError("Connection failed. Please try again.");
  //       console.error("Connection error:", err);
  //     }
  //   };

  const handleConnect = () => {
    if (name) {
      const newSocket = io("ws://localhost:8080", {
        path: "/connect", // Ensure this matches the backend path
        query: { name },
        withCredentials: true,
        //   headers: {
        //     "Access-Control-Allow-Origin": "http://localhost:5173", // Your frontend URL
        //     "Access-Control-Allow-Credentials": "true",
        //   },
        transports: ["websocket"], // Force WebSocket transport
      });
      newSocket.on("connect_error", (err) => {
        console.error("Connection error:", err.message);
        setError(`Connection error: ${err.message}`);
      });
      setSocket(newSocket);
    } else {
      setError(
        "Invalid name. Name should be alphanumeric and between 3 and 20 characters."
      );
    }
  };

  const handleCreateGame = () => {
    if (socket) {
      socket.emit("player_command", {
        type: "create",
        payload: { name: "New Game", question_count: 10 },
      });
    }
  };

  const handleJoinGame = () => {
    if (socket && gameId) {
      socket.emit("player_command", {
        type: "join",
        payload: { game_id: gameId },
      });
    }
  };

  const handleReady = () => {
    if (socket && gameId) {
      socket.emit("player_command", {
        type: "ready",
        payload: { game_id: gameId },
      });
    }
  };

  const handleStartGame = () => {
    if (socket && gameId) {
      socket.emit("player_command", {
        type: "start",
        payload: { game_id: gameId },
      });
    }
  };

  const handleAnswer = (index: number, questionId: string) => {
    if (socket && gameId) {
      socket.emit("player_command", {
        type: "answer",
        payload: { game_id: gameId, index, question_id: questionId },
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Game List</h1>
      {!connected ? (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <button
            onClick={handleConnect}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Connect
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={handleCreateGame}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          >
            Create Game
          </button>
          <input
            type="text"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <button
            onClick={handleJoinGame}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            Join Game
          </button>
          {gameState === "waiting" && (
            <button
              onClick={handleReady}
              className="bg-yellow-500 text-white px-4 py-2 rounded mb-4"
            >
              Ready
            </button>
          )}
          {question && (
            <div>
              <h2 className="text-xl font-bold mb-2">{question.question}</h2>
              {question.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index, question.id)}
                  className="bg-gray-200 p-2 mb-2 w-full text-left"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          {gameState === "ended" && (
            <div>
              <h2 className="text-xl font-bold mb-2">Scores</h2>
              {scores.map((score, index) => (
                <div key={index} className="mb-2">
                  {score.name}: {score.score}
                </div>
              ))}
            </div>
          )}
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
              <p>Question Count: {game.questionCount}</p>
              <p>State: {game.state}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Captrivia;
