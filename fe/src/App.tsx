import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Api } from "./api";
import useWebSocket from "./hooks/useWebSocket";
import useApi from "./hooks/useApi";
import Home from "./components/Home";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const api = new Api("http://localhost:8080");

export const triggerToast = (message: string) => {
  toast(message);
};

const App: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [gameName, setGameName] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);

  const {
    games,
    isLoading,
    error,
    leaderboard,
    fetchGames,
    fetchLeaderboard,
    handleCreateGame,
    handleJoinGame,
    handleReadyGame,
    handleStartGame,
    handleAnswerGame,
  } = useApi(api, gameName, questionCount, setGameName, setQuestionCount);

  const navigate = useNavigate();

  const { isConnected, handleConnect, disconnect } = useWebSocket(
    api,
    playerName,
    fetchGames,
    fetchLeaderboard,
    navigate
  );

  useEffect(() => {
    fetchLeaderboard();
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
