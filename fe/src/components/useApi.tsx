// useApi.ts
import { useState, useEffect, useCallback } from "react";
import { Api, LobbyGame } from "../api"; // Adjust import paths as necessary
import { AxiosError } from "axios";

const useApi = (
  api: Api,
  gameName,
  questionCount,
  setGameName,
  setQuestionCount
) => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const gameList = await api.fetchGameList();
      setGames(gameList);
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
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const leaderboardResults = await api.fetchLeaderboard();
      setLeaderboard(leaderboardResults);
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
    } finally {
      setIsLoading(false);
    }
  }, [api]);

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
    // Optionally, fetchGames or other initial data fetching can be done here
  }, [fetchLeaderboard]);

  return {
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
  };
};

export default useApi;
