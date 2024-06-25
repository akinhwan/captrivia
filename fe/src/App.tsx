import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Api, LobbyGame } from "./api";
import { AxiosError } from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./components/Home";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";
import "./index.css";

const api = new Api("http://localhost:8080");

export const triggerToast = (message: string) => {
  toast(message);
};

const App: React.FC = () => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [gameName, setGameName] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();

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
      const leaderboardResults = await api.fetchLeaderboard();
      setLeaderboard(leaderboardResults);
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

  const handleConnect = () => {
    api.connectToServer(playerName, (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.error) {
        toast.error(`${data.error}`);
      } else if (data.type === "game_player_enter") {
        // send creator straight into the game
        navigate("/game", { state: { data: data, playerName: playerName } });
        // when a new player enters (not creator)
        // send latest data.payload.players_ready array to Game to display status
      } else if (data.type === "game_join") {
        // setJoinedGames((prevJoinedGames) =>
        //   new Set(prevJoinedGames).add(data.id)
        // );
      } else if (data.type === "game_create") {
        fetchGames();
      } else if (data.type === "game_destroy") {
        fetchGames();
      } else if (data.type === "game_start") {
        console.log("Game started:", data.id);
      } else if (data.type === "game_player_join") {
        // Handle player join
      } else if (data.type === "game_player_ready") {
        // TODO
        // update state of ready players
        // navigate("/game", { state: { player_ready: data.payload.player } });
      } else if (data.type === "game_player_leave") {
        // Handle player leave
      } else if (data.type === "game_countdown") {
        // Handle countdown
      } else if (data.type === "game_question") {
        navigate("/game", {
          state: { question: data, playerName: playerName },
        });
      } else if (data.type === "game_player_correct") {
        if (data.payload.player === playerName) {
          toast.success("Correct Answer!");
        }
      } else if (data.type === "game_player_incorrect") {
        if (data.payload.player === playerName) {
          toast.error("Incorrect Answer.");
        }
      } else if (data.type === "game_end") {
        fetchLeaderboard();
        fetchGames();
        navigate("/leaderboard");
      }
    });
    setIsConnected(true);
  };

  const handleCreateGame = async () => {
    api.createGame(gameName, questionCount);
    setGameName("");
    setQuestionCount(5);
    fetchGames();
  };

  const handleJoinGame = (game_id: string) => {
    console.log(`Joining game: ${game_id}`);
    api.joinGame(game_id);
  };

  const handleReadyGame = (game_id: string) => {
    api.readyGame(game_id);
  };

  const handleStartGame = (game_id: string) => {
    api.startGame(game_id);
    // toast.error("Cannot start game: not all players are ready");
  };

  const handleAnswerGame = (
    game_id: string,
    index: number,
    question_id: string
  ) => {
    api.answerGame(game_id, index, question_id);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    return () => {
      api.disconnect(); // Cleanup WebSocket connection on component unmount
      setIsConnected(false);
    };
  }, []);

  return (
    <div className="container mx-auto p-8">
      <ToastContainer position="bottom-center" autoClose={5000} />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              games={games}
              fetchGames={fetchGames}
              fetchLeaderboard={fetchLeaderboard}
              isConnected={isConnected}
              playerName={playerName}
              setPlayerName={setPlayerName}
              handleConnect={handleConnect}
              gameName={gameName}
              setGameName={setGameName}
              questionCount={questionCount}
              setQuestionCount={setQuestionCount}
              isLoading={isLoading}
              error={error}
              handleCreateGame={handleCreateGame}
              handleJoinGame={handleJoinGame}
              handleReadyGame={handleReadyGame}
              handleStartGame={handleStartGame}
            />
          }
        />
        <Route
          path="/game"
          element={
            <Game
              handleAnswerGame={handleAnswerGame}
              handleReadyGame={handleReadyGame}
              handleStartGame={handleStartGame}
            />
          }
        />
        <Route
          path="/leaderboard"
          element={<Leaderboard leaderboard={leaderboard} />}
        />
      </Routes>
    </div>
  );
};

export default App;
